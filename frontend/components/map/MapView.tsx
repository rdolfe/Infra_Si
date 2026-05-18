"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import HeatmapLayer from "./HeatmapLayer";
import ListingMarker from "./ListingMarker";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type ViewMode = "heatmap" | "listings";

interface HeatmapData {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: { type: string; coordinates: number[][][] };
    properties: { avg_price: number; count: number };
  }>;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  address: string;
  lat: number | null;
  lng: number | null;
}

interface FlyToHandlerProps {
  flyTo?: { lat: number; lng: number };
}

function FlyToHandler({ flyTo }: FlyToHandlerProps) {
  const map = useMap();
  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], 12);
    }
  }, [flyTo, map]);
  return null;
}

export default function MapView({ mode, flyTo }: { mode?: ViewMode; flyTo?: { lat: number; lng: number } }) {
  const [viewMode, setViewMode] = useState<ViewMode>(mode ?? "listings");
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/analytics/heatmap`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setHeatmapData(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/properties?prop_status=published&limit=100`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.items && setListings(d.items))
      .catch(() => {});
  }, []);

  const geoListings = listings.filter(
    (l): l is Listing & { lat: number; lng: number } =>
      l.lat != null && l.lng != null
  );

  return (
    <div className="relative w-full h-full">
      {!mode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex bg-white rounded-full shadow-md overflow-hidden border border-stone-200">
          <button
            onClick={() => setViewMode("listings")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "listings"
                ? "bg-terracotta text-white"
                : "text-charcoal hover:bg-stone-50"
            }`}
          >
            Annonces
          </button>
          <button
            onClick={() => setViewMode("heatmap")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "heatmap"
                ? "bg-terracotta text-white"
                : "text-charcoal hover:bg-stone-50"
            }`}
          >
            Heatmap prix
          </button>
        </div>
      )}

      <MapContainer
        center={[46.8, 2.3]}
        zoom={6}
        className="w-full h-full"
        style={{ minHeight: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToHandler flyTo={flyTo} />

        {(viewMode === "heatmap" || mode === "heatmap") && heatmapData && (
          <HeatmapLayer data={heatmapData} />
        )}

        {(viewMode === "listings" || !mode || mode === "listings") &&
          geoListings.map((listing) => (
            <ListingMarker key={listing.id} listing={listing} />
          ))}
      </MapContainer>
    </div>
  );
}
