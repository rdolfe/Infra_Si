"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import ChatThread from "@/components/messages/ChatThread";
import CounterOfferModal from "@/components/offers/CounterOfferModal";

interface OfferDetail {
  id: string;
  property_id: string;
  client_id: string;
  agent_id: string;
  proposed_price: number;
  counter_price: number | null;
  status: "pending" | "countered" | "accepted" | "rejected";
  created_at: string;
}

const STATUS_LABELS: Record<OfferDetail["status"], string> = {
  pending: "En attente",
  countered: "Contre-offre",
  accepted: "Acceptée",
  rejected: "Refusée",
};

const STATUS_COLORS: Record<OfferDetail["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  countered: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default function AgencyOfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = auth.getUser();

  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loadingOffer, setLoadingOffer] = useState(true);
  const [counterOpen, setCounterOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    if (user.role !== "agent") { router.replace("/agency/offers"); return; }
    loadOffer();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadOffer() {
    setLoadingOffer(true);
    try {
      const res = await api.get(`/api/offers/${id}`);
      if (!res.ok) throw new Error();
      setOffer(await res.json());
    } catch {
      setError("Impossible de charger cette offre.");
    } finally {
      setLoadingOffer(false);
    }
  }

  async function handleAction(action: "accept" | "reject") {
    if (!offer) return;
    setActionLoading(action);
    setError(null);
    try {
      const res = await api.put(`/api/offers/${offer.id}`, { action });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail ?? "Erreur");
      }
      setOffer(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(null);
    }
  }

  if (!user || user.role !== "agent") return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link href="/agency/offers" className="text-sm text-charcoal-light hover:text-terracotta transition-colors">
        ← Retour aux offres
      </Link>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 my-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        {/* Offer info + actions */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 space-y-4">
          <h1 className="font-playfair text-xl font-bold text-charcoal">Offre reçue</h1>

          {loadingOffer ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 rounded-lg bg-stone-100" />
              ))}
            </div>
          ) : offer ? (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-charcoal-light">Statut</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[offer.status]}`}>
                    {STATUS_LABELS[offer.status]}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-charcoal-light">Prix proposé</span>
                  <span className="font-semibold text-charcoal">{formatPrice(offer.proposed_price)}</span>
                </div>
                {offer.counter_price && (
                  <div className="flex justify-between items-center">
                    <span className="text-charcoal-light">Contre-offre</span>
                    <span className="font-semibold text-blue-700">{formatPrice(offer.counter_price)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-charcoal-light">Date</span>
                  <span className="text-charcoal">{formatDate(offer.created_at)}</span>
                </div>
              </div>

              {(offer.status === "pending" || offer.status === "countered") && (
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleAction("accept")}
                    disabled={actionLoading !== null}
                    className="w-full py-2 rounded-lg bg-terracotta text-white text-sm font-medium hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === "accept" ? "Traitement…" : "Accepter"}
                  </button>
                  <button
                    onClick={() => setCounterOpen(true)}
                    disabled={actionLoading !== null}
                    className="w-full py-2 rounded-lg border border-terracotta text-terracotta text-sm font-medium hover:bg-terracotta/5 disabled:opacity-50 transition-colors"
                  >
                    Contre-offre
                  </button>
                  <button
                    onClick={() => handleAction("reject")}
                    disabled={actionLoading !== null}
                    className="w-full py-2 rounded-lg border border-stone-200 text-charcoal text-sm font-medium hover:bg-stone-50 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === "reject" ? "Traitement…" : "Refuser"}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Chat */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 flex flex-col h-[560px]">
          {offer && <ChatThread offerId={offer.id} />}
        </div>
      </div>

      {counterOpen && offer && (
        <CounterOfferModal
          offerId={offer.id}
          open={counterOpen}
          onClose={() => setCounterOpen(false)}
          onSuccess={loadOffer}
        />
      )}
    </div>
  );
}
