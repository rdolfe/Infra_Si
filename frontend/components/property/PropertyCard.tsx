import Link from "next/link";
import { DpeBadge } from "@/components/ui/Badge";

export interface PhotoSummary {
  id: string;
  url: string;
  display_order: number;
}

export interface PropertySummary {
  id: string;
  title: string;
  price: number;
  surface: number;
  rooms: number;
  type: string;
  category: string;
  address: string;
  dpe_rating: string | null;
  coup_de_coeur: boolean;
  status: string;
  lat: number | null;
  lng: number | null;
  photos: PhotoSummary[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

function resolveImageUrl(url: string, propertyId: string): string {
  if (!url) return `https://picsum.photos/seed/${propertyId}/800/600`;
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
}

export default function PropertyCard({
  property,
}: {
  property: PropertySummary;
}) {
  const firstPhoto = property.photos?.[0];
  const imageUrl = firstPhoto
    ? resolveImageUrl(firstPhoto.url, property.id)
    : `https://picsum.photos/seed/${property.id}/800/600`;

  return (
    <Link
      href={`/listings/${property.id}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-stone-100"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <img
          src={imageUrl}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {property.coup_de_coeur && (
          <div className="absolute top-2 left-2 bg-terracotta text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            Coup de cœur
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-playfair text-base font-semibold text-charcoal line-clamp-1 mb-1">
          {property.title}
        </h3>
        <p className="text-terracotta font-semibold text-lg mb-2">
          {formatPrice(property.price)}
        </p>
        <div className="flex items-center gap-3 text-sm text-charcoal-light mb-2 flex-wrap">
          <span>{property.surface} m²</span>
          <span>·</span>
          <span>
            {property.rooms} pièce{property.rooms > 1 ? "s" : ""}
          </span>
          {property.dpe_rating && (
            <>
              <span>·</span>
              <DpeBadge rating={property.dpe_rating} />
            </>
          )}
        </div>
        <p className="text-xs text-charcoal-light truncate">{property.address}</p>
      </div>
    </Link>
  );
}
