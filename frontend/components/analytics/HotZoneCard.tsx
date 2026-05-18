"use client";

export interface HotZone {
  zone_name: string;
  lat: number;
  lng: number;
  score: number;
  avg_price: number;
  listing_count: number;
}

interface HotZoneCardProps {
  zone: HotZone;
  rank: number;
  onClick: (zone: HotZone) => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function HotZoneCard({ zone, rank, onClick }: HotZoneCardProps) {
  const scorePercent = Math.min(Math.round(zone.score * 100), 100);

  return (
    <button
      type="button"
      onClick={() => onClick(zone)}
      className="w-full text-left bg-white rounded-xl border border-stone-100 shadow-sm p-4 hover:shadow-md hover:border-terracotta/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
      aria-label={`Centrer la carte sur ${zone.zone_name}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center text-sm font-bold flex-shrink-0">
          {rank}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-playfair font-semibold text-charcoal text-sm truncate">
            {zone.zone_name}
          </p>

          <div className="flex items-center gap-4 mt-1 text-xs text-charcoal-light">
            <span>{formatPrice(zone.avg_price)} moy.</span>
            <span>{zone.listing_count} annonce{zone.listing_count > 1 ? "s" : ""}</span>
          </div>

          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-charcoal-light">Score</span>
              <span className="text-xs font-medium text-charcoal">{scorePercent}%</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-1.5">
              <div
                className="bg-terracotta rounded-full h-1.5 transition-all"
                style={{ width: `${scorePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
