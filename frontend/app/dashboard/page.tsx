"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import OfferCard, { type OfferSummary } from "@/components/offers/OfferCard";
import PropertyCard, { type PropertySummary } from "@/components/property/PropertyCard";

type Tab = "offers" | "favorites" | "messages";

interface MessageThread {
  offer_id: string;
  property_id: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

const TAB_LABELS: Record<Tab, string> = {
  offers: "Mes offres",
  favorites: "Mes favoris",
  messages: "Mes messages",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("offers");
  const [offers, setOffers] = useState<OfferSummary[]>([]);
  const [favorites, setFavorites] = useState<PropertySummary[]>([]);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [offersError, setOffersError] = useState<string | null>(null);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [threadsError, setThreadsError] = useState<string | null>(null);

  const user = auth.getUser();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "client") {
      router.replace("/");
      return;
    }
    // Load threads on mount to populate the unread badge
    loadThreads();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user || user.role !== "client") return;
    if (activeTab === "offers") loadOffers();
    if (activeTab === "favorites") loadFavorites();
    if (activeTab === "messages") loadThreads();
  }, [activeTab]);

  async function loadOffers() {
    setLoadingOffers(true);
    setOffersError(null);
    try {
      const res = await api.get("/api/offers");
      if (!res.ok) throw new Error();
      setOffers(await res.json());
    } catch {
      setOffersError("Impossible de charger vos offres.");
    } finally {
      setLoadingOffers(false);
    }
  }

  async function loadFavorites() {
    setLoadingFavorites(true);
    setFavoritesError(null);
    try {
      const res = await api.get("/api/properties/favorites/list");
      if (!res.ok) throw new Error();
      setFavorites(await res.json());
    } catch {
      setFavoritesError("Impossible de charger vos favoris.");
    } finally {
      setLoadingFavorites(false);
    }
  }

  async function loadThreads() {
    setLoadingThreads(true);
    setThreadsError(null);
    try {
      const res = await api.get("/api/messages/threads");
      if (res.status === 404) {
        // Endpoint not yet available — derive threads from the offers list
        const offersRes = await api.get("/api/offers");
        if (!offersRes.ok) throw new Error();
        const offerList: OfferSummary[] = await offersRes.json();
        setThreads(
          offerList.map((o) => ({
            offer_id: o.id,
            property_id: o.property_id,
            last_message: "Voir la conversation →",
            last_message_at: o.created_at,
            unread_count: 0,
          }))
        );
        return;
      }
      if (!res.ok) throw new Error();
      setThreads(await res.json());
    } catch {
      setThreadsError("Impossible de charger vos messages.");
    } finally {
      setLoadingThreads(false);
    }
  }

  if (!user || user.role !== "client") return null;

  const totalUnread = threads.reduce((sum, t) => sum + t.unread_count, 0);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-playfair text-3xl font-bold text-charcoal mb-2">
          Mon espace
        </h1>
        <p className="text-charcoal-light text-sm mb-8">
          Bonjour, {user.name}
        </p>

        <div className="border-b border-stone-200 mb-6">
          <div role="tablist" aria-label="Tableau de bord" className="flex gap-1">
            {(["offers", "favorites", "messages"] as Tab[]).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`panel-${tab}`}
                id={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`inline-flex items-center gap-1.5 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-terracotta text-terracotta"
                    : "border-transparent text-charcoal-light hover:text-charcoal"
                }`}
              >
                {TAB_LABELS[tab]}
                {tab === "messages" && totalUnread > 0 && (
                  <span className="bg-terracotta text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center leading-none">
                    {totalUnread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "offers" && (
          <section
            role="tabpanel"
            id="panel-offers"
            aria-labelledby="tab-offers"
          >
            {offersError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
                {offersError}
              </div>
            )}
            {loadingOffers ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-xl bg-stone-100 animate-pulse" />
                ))}
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-16 text-charcoal-light">
                <p className="text-lg mb-2">Aucune offre pour le moment.</p>
                <Link
                  href="/listings"
                  className="text-sm text-terracotta hover:underline"
                >
                  Parcourir les annonces →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {offers.map((offer) => (
                  <Link
                    key={offer.id}
                    href={`/dashboard/offers/${offer.id}`}
                    className="block hover:opacity-90 transition-opacity"
                  >
                    <OfferCard offer={offer} />
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "favorites" && (
          <section role="tabpanel" id="panel-favorites" aria-labelledby="tab-favorites">
            {favoritesError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
                {favoritesError}
              </div>
            )}
            {loadingFavorites ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-64 rounded-xl bg-stone-100 animate-pulse" />
                ))}
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-16 text-charcoal-light">
                <p className="text-lg mb-2">Aucun favori pour le moment.</p>
                <Link
                  href="/listings"
                  className="text-sm text-terracotta hover:underline"
                >
                  Découvrir des biens →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favorites.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "messages" && (
          <section role="tabpanel" id="panel-messages" aria-labelledby="tab-messages">
            {threadsError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
                {threadsError}
              </div>
            )}
            {loadingThreads ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-stone-100 animate-pulse" />
                ))}
              </div>
            ) : threads.length === 0 ? (
              <div className="text-center py-16 text-charcoal-light">
                <p className="text-lg">Aucun message pour le moment.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {threads.map((thread) => (
                  <li key={thread.offer_id}>
                    <Link
                      href={`/dashboard/offers/${thread.offer_id}`}
                      className="flex items-start justify-between gap-4 bg-white rounded-xl border border-stone-100 shadow-sm px-4 py-3 hover:shadow-md transition-shadow"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-charcoal-light mb-0.5">
                          Offre #{thread.offer_id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-charcoal truncate">
                          {thread.last_message}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-charcoal-light">
                          {formatDate(thread.last_message_at)}
                        </p>
                        {thread.unread_count > 0 && (
                          <span className="inline-block mt-1 bg-terracotta text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                            {thread.unread_count}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
