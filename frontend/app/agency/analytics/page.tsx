"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import HotZoneCard, { type HotZone } from "@/components/analytics/HotZoneCard";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

export default function AgencyAnalyticsPage() {
  const [zones, setZones] = useState<HotZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | undefined>(
    undefined
  );

  const user = auth.getUser();

  useEffect(() => {
    api
      .get("/api/analytics/hot-zones")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: HotZone[]) => setZones(data))
      .catch(() => setError("Impossible de charger les zones chaudes."))
      .finally(() => setLoading(false));
  }, []);

  if (user?.role !== "agent") {
    return (
      <div className="p-6 text-center text-red-600">
        Accès réservé aux agents.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="font-playfair text-2xl font-bold text-charcoal mb-6">
        Analyse du marché
      </h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100">
              <h2 className="font-semibold text-charcoal">Carte des prix</h2>
            </div>
            <div style={{ height: "480px" }}>
              <MapView mode="heatmap" flyTo={flyTo} />
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm">
            <div className="px-4 py-3 border-b border-stone-100">
              <h2 className="font-semibold text-charcoal">Zones chaudes</h2>
              <p className="text-xs text-charcoal-light mt-0.5">
                Cliquez sur une zone pour centrer la carte
              </p>
            </div>

            <div className="p-3 space-y-2">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-stone-100 rounded-xl animate-pulse"
                  />
                ))
              ) : error ? (
                <p className="text-sm text-red-600 px-2 py-3">{error}</p>
              ) : zones.length === 0 ? (
                <p className="text-sm text-charcoal-light px-2 py-3">
                  Aucune donnée disponible.
                </p>
              ) : (
                zones.map((zone, i) => (
                  <HotZoneCard
                    key={zone.zone_name}
                    zone={zone}
                    rank={i + 1}
                    onClick={(z) => setFlyTo({ lat: z.lat, lng: z.lng })}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
