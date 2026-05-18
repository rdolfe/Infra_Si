"use client";

import { type ReactNode } from "react";

export interface OfferSummary {
  id: string;
  property_id: string;
  client_id: string;
  agent_id: string;
  proposed_price: number;
  counter_price: number | null;
  status: "pending" | "countered" | "accepted" | "rejected";
  created_at: string;
  property_title?: string;
  property_photo?: string;
}

interface OfferCardProps {
  offer: OfferSummary;
  actions?: ReactNode;
}

const STATUS_LABELS: Record<OfferSummary["status"], string> = {
  pending: "En attente",
  countered: "Contre-offre",
  accepted: "Acceptée",
  rejected: "Refusée",
};

const STATUS_COLORS: Record<OfferSummary["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  countered: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export default function OfferCard({ offer, actions }: OfferCardProps) {
  const photoUrl =
    offer.property_photo ||
    `https://picsum.photos/seed/${offer.property_id}/800/600`;

  return (
    <div className="flex items-start gap-4 bg-white rounded-xl border border-stone-100 shadow-sm p-4">
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
        <img
          src={photoUrl}
          alt={offer.property_title ?? "Bien immobilier"}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex-1 min-w-0">
        {offer.property_title && (
          <p className="text-sm font-medium text-charcoal line-clamp-1 mb-1">
            {offer.property_title}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[offer.status]}`}
          >
            {STATUS_LABELS[offer.status]}
          </span>
          <span className="text-xs text-charcoal-light">
            {formatDate(offer.created_at)}
          </span>
        </div>

        <p className="text-base font-semibold text-terracotta">
          {formatPrice(offer.proposed_price)}
        </p>

        {offer.counter_price && (
          <p className="text-sm text-charcoal-light mt-0.5">
            Contre-offre : {formatPrice(offer.counter_price)}
          </p>
        )}
      </div>

      {actions && <div className="flex flex-col gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
