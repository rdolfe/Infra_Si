"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import ChatThread from "@/components/messages/ChatThread";
import DocumentPanel from "@/components/documents/DocumentPanel";

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

interface Transaction {
  id: string;
  offer_id: string;
  status: string;
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

export default function OfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loadingOffer, setLoadingOffer] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    loadOffer();
    loadTransaction();
  }, [id]);

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

  async function loadTransaction() {
    try {
      const res = await api.get("/api/transactions");
      if (!res.ok) return;
      const txs: Transaction[] = await res.json();
      const linked = txs.find((t) => t.offer_id === id) ?? null;
      setTransaction(linked);
    } catch {
      // non-blocking
    }
  }

  async function handleAction(action: "accept" | "reject") {
    if (!offer) return;
    if (
      action === "reject" &&
      !confirm("Confirmer le refus de la contre-offre ?")
    )
      return;
    setActionLoading(action);
    setError(null);
    try {
      const res = await api.put(`/api/offers/${offer.id}`, { action });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail ?? "Une erreur est survenue.");
      }
      const updated: OfferDetail = await res.json();
      setOffer(updated);
      if (action === "accept") await loadTransaction();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setActionLoading(null);
    }
  }

  if (!user || user.role !== "client") return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm text-charcoal-light hover:text-terracotta transition-colors"
          >
            ← Retour au tableau de bord
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left panel — Offer info */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h1 className="font-playfair text-xl font-bold text-charcoal mb-4">
              Détail de l&apos;offre
            </h1>

            {loadingOffer ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-8 rounded-lg bg-stone-100 animate-pulse"
                  />
                ))}
              </div>
            ) : offer ? (
              <div className="space-y-4">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-100">
                  <img
                    src={`https://picsum.photos/seed/${offer.property_id}/800/600`}
                    alt="Bien immobilier"
                    className="w-full h-full object-cover"
                  />
                </div>

                <Link
                  href={`/listings/${offer.property_id}`}
                  className="text-sm text-terracotta hover:underline block"
                >
                  Voir l&apos;annonce →
                </Link>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-charcoal-light">Statut</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[offer.status]}`}
                    >
                      {STATUS_LABELS[offer.status]}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-charcoal-light">Votre offre</span>
                    <span className="font-semibold text-charcoal">
                      {formatPrice(offer.proposed_price)}
                    </span>
                  </div>

                  {offer.counter_price && (
                    <div className="flex justify-between items-center">
                      <span className="text-charcoal-light">
                        Contre-offre agent
                      </span>
                      <span className="font-semibold text-blue-700">
                        {formatPrice(offer.counter_price)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-charcoal-light">Date</span>
                    <span className="text-charcoal">
                      {formatDate(offer.created_at)}
                    </span>
                  </div>
                </div>

                {offer.status === "countered" && (
                  <div className="pt-2 space-y-2">
                    <p className="text-xs text-charcoal-light text-center">
                      L&apos;agent a fait une contre-offre à{" "}
                      <strong>{formatPrice(offer.counter_price!)}</strong>.
                      Souhaitez-vous l&apos;accepter ?
                    </p>
                    <button
                      onClick={() => handleAction("accept")}
                      disabled={actionLoading !== null}
                      className="w-full py-2 rounded-lg bg-terracotta text-white text-sm font-medium hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === "accept"
                        ? "Traitement…"
                        : "Accepter la contre-offre"}
                    </button>
                    <button
                      onClick={() => handleAction("reject")}
                      disabled={actionLoading !== null}
                      className="w-full py-2 rounded-lg border border-stone-200 text-sm font-medium text-charcoal hover:bg-stone-50 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === "reject" ? "Traitement…" : "Refuser"}
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Middle panel — Chat */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 flex flex-col h-[560px]">
            {offer && <ChatThread offerId={offer.id} />}
          </div>

          {/* Right panel — Documents */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            {transaction ? (
              <DocumentPanel transactionId={transaction.id} />
            ) : (
              <div>
                <h2 className="font-playfair text-lg font-semibold text-charcoal mb-3">
                  Documents
                </h2>
                <p className="text-sm text-charcoal-light">
                  Aucune transaction en cours.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
