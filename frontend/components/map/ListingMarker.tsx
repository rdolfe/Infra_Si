"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";

const terracottaIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:28px;height:28px;border-radius:50% 50% 50% 0;
    background:#C0694A;border:2px solid white;
    transform:rotate(-45deg);
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
});

interface Listing {
  id: string;
  title: string;
  price: number;
  address: string;
  lat: number;
  lng: number;
}

export default function ListingMarker({ listing }: { listing: Listing }) {
  const priceStr = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(listing.price);

  return (
    <Marker position={[listing.lat, listing.lng]} icon={terracottaIcon}>
      <Popup>
        <div className="text-sm min-w-[160px]">
          <p className="font-semibold text-charcoal line-clamp-2 mb-1">
            {listing.title}
          </p>
          <p className="text-terracotta font-bold mb-1">{priceStr}</p>
          <p className="text-xs text-charcoal-light mb-2">{listing.address}</p>
          <Link
            href={`/listings/${listing.id}`}
            className="text-xs text-terracotta hover:underline"
          >
            Voir l'annonce →
          </Link>
        </div>
      </Popup>
    </Marker>
  );
}
