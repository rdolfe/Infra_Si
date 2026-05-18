"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";

interface ListingRow {
  id: string;
  title: string;
  price: number;
  status: string;
  type: string;
  address: string;
  created_at: string;
  agent_id: string;
}

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
  published: "success",
  draft: "warning",
  sold: "error",
};

function formatPrice(p: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(p);
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/properties?limit=100`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setListings(d.items ?? []))
      .catch(() => setError("Impossible de charger les annonces."))
      .finally(() => setLoading(false));
  }, []);

  async function setStatus(id: string, status: string) {
    setActionLoading(id);
    try {
      const res = await api.put(`/api/properties/${id}`, { status });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: updated.status } : l)));
    } catch {
      setError("Erreur lors de la mise à jour du statut.");
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteListing(id: string) {
    if (!confirm("Supprimer cette annonce ?")) return;
    setActionLoading(id);
    try {
      const res = await api.delete(`/api/properties/${id}`);
      if (!res.ok) throw new Error();
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch {
      setError("Erreur lors de la suppression.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      <h1 className="font-playfair text-2xl font-bold text-charcoal mb-6">
        Annonces
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-charcoal-light text-sm">Chargement…</p>
      ) : (
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-light uppercase tracking-wide">
                  Titre
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-light uppercase tracking-wide">
                  Prix
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-light uppercase tracking-wide">
                  Statut
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-light uppercase tracking-wide hidden sm:table-cell">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-light uppercase tracking-wide hidden lg:table-cell">
                  Adresse
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="font-medium text-charcoal hover:text-terracotta transition-colors line-clamp-1"
                    >
                      {listing.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-charcoal-light whitespace-nowrap">
                    {formatPrice(listing.price)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={listing.status}
                      variant={STATUS_VARIANT[listing.status] ?? "default"}
                    />
                  </td>
                  <td className="px-4 py-3 text-charcoal-light hidden sm:table-cell">
                    {listing.type}
                  </td>
                  <td className="px-4 py-3 text-charcoal-light text-xs truncate max-w-xs hidden lg:table-cell">
                    {listing.address}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {listing.status === "draft" && (
                        <button
                          onClick={() => setStatus(listing.id, "published")}
                          disabled={actionLoading === listing.id}
                          className="text-xs font-medium text-sage-dark hover:underline disabled:opacity-50"
                        >
                          Publier
                        </button>
                      )}
                      {listing.status === "published" && (
                        <button
                          onClick={() => setStatus(listing.id, "draft")}
                          disabled={actionLoading === listing.id}
                          className="text-xs font-medium text-charcoal-light hover:underline disabled:opacity-50"
                        >
                          Dépublier
                        </button>
                      )}
                      <button
                        onClick={() => deleteListing(listing.id)}
                        disabled={actionLoading === listing.id}
                        className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {listings.length === 0 && (
            <p className="text-center text-sm text-charcoal-light py-8">
              Aucune annonce.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
