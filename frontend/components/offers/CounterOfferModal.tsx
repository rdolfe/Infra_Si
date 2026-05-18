"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";

interface CounterOfferModalProps {
  offerId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CounterOfferModal({
  offerId,
  open,
  onClose,
  onSuccess,
}: CounterOfferModalProps) {
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const res = await api.put(`/api/offers/${offerId}`, {
        action: "counter",
        new_price: numPrice,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.detail ?? "Une erreur est survenue.");
        return;
      }

      setPrice("");
      onSuccess();
      onClose();
    } catch {
      setError("Impossible d'envoyer la contre-offre. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Contre-offre">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-charcoal-light">
          Proposez un nouveau prix au client.
        </p>

        <Input
          label="Nouveau prix (€)"
          type="number"
          min="1"
          step="1000"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Ex : 230000"
          error={error ?? undefined}
          required
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Envoyer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
