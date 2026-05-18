"use client";

import { GeoJSON } from "react-leaflet";

interface HeatmapFeature {
  type: "Feature";
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  properties: {
    avg_price: number;
    count: number;
  };
}

interface HeatmapData {
  type: "FeatureCollection";
  features: HeatmapFeature[];
}

function priceToColor(price: number, minPrice: number, maxPrice: number): string {
  if (maxPrice === minPrice) return "hsl(30, 80%, 50%)";
  const ratio = (price - minPrice) / (maxPrice - minPrice);
  const hue = Math.round(120 - ratio * 120);
  return `hsl(${hue}, 80%, 45%)`;
}

export default function HeatmapLayer({ data }: { data: HeatmapData }) {
  const prices = data.features.map((f) => f.properties.avg_price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return (
    <>
      {data.features.map((feature, idx) => (
        <GeoJSON
          key={idx}
          data={feature as unknown as Parameters<typeof GeoJSON>[0]["data"]}
          style={{
            fillColor: priceToColor(feature.properties.avg_price, minPrice, maxPrice),
            fillOpacity: 0.5,
            color: "white",
            weight: 1,
          }}
          onEachFeature={(_, layer) => {
            layer.bindPopup(
              `<strong>${new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              }).format(feature.properties.avg_price)}</strong><br/>Prix moyen — ${feature.properties.count} annonce${feature.properties.count > 1 ? "s" : ""}`
            );
          }}
        />
      ))}
    </>
  );
}
