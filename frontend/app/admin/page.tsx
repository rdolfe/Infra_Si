"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Stats {
  total_users: number;
  total_listings: number;
  active_transactions: number;
  total_agencies: number;
}

const STAT_CARDS = [
  { key: "total_users", label: "Utilisateurs", icon: "👤" },
  { key: "total_listings", label: "Annonces", icon: "🏠" },
  { key: "active_transactions", label: "Transactions actives", icon: "📋" },
  { key: "total_agencies", label: "Agences", icon: "🏢" },
] as const;

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setStats)
      .catch(() => setError("Impossible de charger les statistiques."));
  }, []);

  return (
    <div>
      <h1 className="font-playfair text-2xl font-bold text-charcoal mb-6">
        Vue d'ensemble
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon }) => (
          <div
            key={key}
            className="bg-white rounded-xl border border-stone-100 shadow-sm p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl" aria-hidden="true">
                {icon}
              </span>
            </div>
            <p className="text-3xl font-bold text-charcoal">
              {stats ? stats[key] : "—"}
            </p>
            <p className="text-sm text-charcoal-light mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
