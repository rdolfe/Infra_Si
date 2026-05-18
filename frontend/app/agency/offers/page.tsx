"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import Button from "@/components/ui/Button";
import OfferCard, { type OfferSummary } from "@/components/offers/OfferCard";
import CounterOfferModal from "@/components/offers/CounterOfferModal";

export default function AgencyOffersPage() {
  const [offers, setOffers] = useState<OfferSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counterOfferId, setCounterOfferId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const user = auth.getUser();

  async function loadOffers() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/offers");
      if (!res.ok) throw new Error();
      const data: OfferSummary[] = await res.json();
      setOffers(data);
    } catch {
      setError("Impossible de charger les offres.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOffers();
  }, []);

  async function handleAction(
    offerId: string,
    action: "accept" | "reject"
  ) {
    if (action === "accept" && !confirm("Confirmer l'acceptation de cette offre ?")) return;
    setActionLoading(offerId + action);
    try {
      const res = await api.put(`/api/offers/${offerId}`, { action });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body?.detail ?? "Une erreur est survenue.");
        return;
      }
      await loadOffers();
    } catch {
      alert("Impossible d'effectuer cette action.");
    } finally {
      setActionLoading(null);
    }
  }

  if (user?.role !== "agent") {
    return (
      <div className="p-6 text-center text-red-600">
        Accès réservé aux agents.
      </div>
    );
  }

  const grouped = offers.reduce<Record<string, OfferSummary[]>>((acc, offer) => {
    if (!acc[offer.property_id]) acc[offer.property_id] = [];
    acc[offer.property_id].push(offer);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="font-playfair text-2xl font-bold text-charcoal mb-6">
        Offres reçues
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-stone-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-16 text-charcoal-light">
          <p className="text-lg">Aucune offre reçue pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([propertyId, propertyOffers]) => (
            <div key={propertyId}>
              <h2 className="text-sm font-medium text-charcoal-light uppercase tracking-wide mb-3">
                Bien {propertyOffers[0].property_title ?? propertyId.slice(0, 8)}
              </h2>
              <div className="space-y-3">
                {propertyOffers.map((offer) => {
                  const isActionable =
                    offer.status === "pending" || offer.status === "countered";
                  return (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      actions={
                        isActionable ? (
                          <>
                            <Button
                              variant="primary"
                              onClick={() => handleAction(offer.id, "accept")}
                              disabled={actionLoading !== null}
                            >
                              {actionLoading === offer.id + "accept" ? "…" : "Accepter"}
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => setCounterOfferId(offer.id)}
                              disabled={actionLoading !== null}
                            >
                              Contre-offre
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => handleAction(offer.id, "reject")}
                              disabled={actionLoading !== null}
                            >
                              {actionLoading === offer.id + "reject" ? "…" : "Refuser"}
                            </Button>
                          </>
                        ) : undefined
                      }
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {counterOfferId && (
        <CounterOfferModal
          offerId={counterOfferId}
          open={!!counterOfferId}
          onClose={() => setCounterOfferId(null)}
          onSuccess={loadOffers}
        />
      )}
    </div>
  );
}
