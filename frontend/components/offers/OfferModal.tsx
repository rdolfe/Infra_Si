"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";

interface OfferModalProps {
  propertyId: string;
  propertyTitle: string;
  open: boolean;
  onClose: () => void;
}

export default function OfferModal({
  propertyId,
  propertyTitle,
  open,
  onClose,
}: OfferModalProps) {
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const numPrice = parseFloat(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      setError("Veuillez saisir un prix valide.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/offers", {
        property_id: propertyId,
        proposed_price: numPrice,
        message: message || undefined,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.detail ?? "Une erreur est survenue.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setPrice("");
        setMessage("");
        onClose();
      }, 1500);
    } catch {
      setError("Impossible de soumettre l'offre. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Faire une offre">
      {success ? (
        <div className="py-6 text-center">
          <div className="w-12 h-12 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-sage-dark"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-semibold text-charcoal">Offre envoyée !</p>
          <p className="text-sm text-charcoal-light mt-1">
            L'agent va être notifié de votre proposition.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-charcoal-light">
            Bien : <span className="font-medium text-charcoal">{propertyTitle}</span>
          </p>

          <Input
            label="Votre offre (€)"
            type="number"
            min="1"
            step="1000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Ex : 250000"
            error={error ?? undefined}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-charcoal font-inter">
              Message (optionnel)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ajoutez un message à l'agent…"
              rows={3}
              className="rounded-md border border-stone-200 px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Soumettre l'offre
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
