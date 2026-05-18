"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface SignModalProps {
  documentId: string;
  fileName: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SignModal({
  documentId,
  fileName,
  open,
  onClose,
  onSuccess,
}: SignModalProps) {
  const [signerName, setSignerName] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  async function handleSign(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmed || !signerName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/api/documents/${documentId}/sign`, {
        signer_name: signerName.trim(),
        confirmed: true,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail ?? "Erreur lors de la signature");
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la signature");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2
          id="sign-modal-title"
          className="font-playfair text-xl font-bold text-charcoal mb-1"
        >
          Signer le document
        </h2>
        <p className="text-sm text-charcoal-light mb-5 truncate">
          {fileName}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSign} className="space-y-4">
          <div>
            <label
              htmlFor="signer-name"
              className="block text-sm font-medium text-charcoal mb-1"
            >
              Nom complet du signataire
            </label>
            <input
              id="signer-name"
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              required
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              placeholder="Prénom Nom"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Date de signature
            </label>
            <p className="text-sm text-charcoal bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
              {today}
            </p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-terracotta focus:ring-terracotta"
            />
            <span className="text-sm text-charcoal">
              Je certifie avoir pris connaissance du document et souhaite le
              signer électroniquement.
            </span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 rounded-lg border border-stone-200 text-sm font-medium text-charcoal hover:bg-stone-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !confirmed || !signerName.trim()}
              className="flex-1 py-2 rounded-lg bg-terracotta text-white text-sm font-medium hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "Signature…" : "Signer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
