"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import Button from "@/components/ui/Button";

interface PropertyRow {
  id: string;
  title: string;
  status: "draft" | "published" | "sold";
  price: number;
  address: string;
  created_at: string;
}

const STATUS_LABELS: Record<PropertyRow["status"], string> = {
  draft: "Brouillon",
  published: "Publié",
  sold: "Vendu",
};

const STATUS_COLORS: Record<PropertyRow["status"], string> = {
  draft: "bg-stone-100 text-charcoal",
  published: "bg-green-100 text-green-800",
  sold: "bg-blue-100 text-blue-800",
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function AgencyListingsPage() {
  const [rows, setRows] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const user = auth.getUser();

  async function loadListings() {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get(
        `/api/properties?agent_id=${user.id}&limit=100`
      );
      if (!res.ok) throw new Error("Erreur lors du chargement.");
      const data = await res.json();
      setRows(data.items ?? []);
    } catch {
      setError("Impossible de charger les annonces.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette annonce ?")) return;
    setDeletingId(id);
    try {
      const res = await api.delete(`/api/properties/${id}`);
      if (!res.ok) throw new Error();
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Impossible de supprimer l'annonce.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleStatus(row: PropertyRow) {
    const newStatus =
      row.status === "published" ? "draft" : "published";
    setTogglingId(row.id);
    try {
      const res = await api.put(`/api/properties/${row.id}`, {
        status: newStatus,
      });
      if (!res.ok) throw new Error();
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: newStatus } : r))
      );
    } catch {
      alert("Impossible de changer le statut.");
    } finally {
      setTogglingId(null);
    }
  }

  if (user?.role !== "agent") {
    return (
      <div className="p-6 text-center text-red-600">
        Accès réservé aux agents.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-playfair text-2xl font-bold text-charcoal">
          Mes annonces
        </h1>
        <Link href="/agency/listings/new">
          <Button variant="primary">+ Nouveau bien</Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-stone-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-charcoal-light">
          <p className="text-lg mb-4">Aucune annonce pour le moment.</p>
          <Link href="/agency/listings/new">
            <Button variant="primary">Créer mon premier bien</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left px-4 py-3 font-medium text-charcoal-light">
                  Titre
                </th>
                <th className="text-left px-4 py-3 font-medium text-charcoal-light hidden md:table-cell">
                  Adresse
                </th>
                <th className="text-left px-4 py-3 font-medium text-charcoal-light">
                  Prix
                </th>
                <th className="text-left px-4 py-3 font-medium text-charcoal-light">
                  Statut
                </th>
                <th className="text-right px-4 py-3 font-medium text-charcoal-light">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-charcoal max-w-[200px] truncate">
                    {row.title}
                  </td>
                  <td className="px-4 py-3 text-charcoal-light hidden md:table-cell max-w-[180px] truncate">
                    {row.address}
                  </td>
                  <td className="px-4 py-3 text-terracotta font-semibold">
                    {formatPrice(row.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[row.status]}`}
                    >
                      {STATUS_LABELS[row.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {row.status !== "sold" && (
                        <button
                          onClick={() => handleToggleStatus(row)}
                          disabled={togglingId === row.id}
                          className="text-xs px-2 py-1 rounded border border-stone-200 text-charcoal hover:bg-stone-50 disabled:opacity-50"
                        >
                          {togglingId === row.id
                            ? "…"
                            : row.status === "published"
                            ? "Dépublier"
                            : "Publier"}
                        </button>
                      )}
                      <Link
                        href={`/agency/listings/${row.id}/edit`}
                        className="text-xs px-2 py-1 rounded border border-stone-200 text-charcoal hover:bg-stone-50"
                      >
                        Éditer
                      </Link>
                      <button
                        onClick={() => handleDelete(row.id)}
                        disabled={deletingId === row.id}
                        className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === row.id ? "…" : "Supprimer"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
