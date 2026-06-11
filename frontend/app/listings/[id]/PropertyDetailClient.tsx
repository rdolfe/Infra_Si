"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import PhotoGallery from "@/components/property/PhotoGallery";
import OfferModal from "@/components/offers/OfferModal";
import { DpeBadge, Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import type { PropertyDetail } from "./page";

const PropertyMap = dynamic(
  () => import("@/components/map/PropertyMap"),
  { ssr: false }
);

const TYPE_LABELS: Record<string, string> = {
  apartment: "Appartement",
  house: "Maison",
  villa: "Villa",
  studio: "Studio",
  office: "Bureau",
  retail: "Commerce",
  warehouse: "Entrepôt",
};

const CATEGORY_LABELS: Record<string, string> = {
  residential: "Résidentiel",
  professional: "Professionnel",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function PropertyDetailClient({ property }: { property: PropertyDetail }) {
  const { user } = useAuth();
  const [offerOpen, setOfferOpen] = useState(false);

  const canMakeOffer = user?.role === "client";

  const details: { label: string; value: string | number | boolean | null }[] = [
    { label: "Surface", value: `${property.surface} m²` },
    { label: "Pièces", value: property.rooms },
    { label: "Type", value: TYPE_LABELS[property.type] ?? property.type },
    { label: "Catégorie", value: CATEGORY_LABELS[property.category] ?? property.category },
    { label: "Étage", value: property.floor ?? "–" },
    { label: "Parking", value: property.parking ? "Oui" : "Non" },
    { label: "Cave", value: property.cellar ? "Oui" : "Non" },
    { label: "Jardin", value: property.garden ? "Oui" : "Non" },
  ];

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <nav className="text-sm text-charcoal-light mb-6">
        <Link href="/listings" className="hover:text-terracotta transition-colors">
          Annonces
        </Link>
        <span className="mx-2">›</span>
        <span className="text-charcoal">{property.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <PhotoGallery photos={property.photos} title={property.title} />

          <div className="flex flex-wrap items-start gap-3">
            <h1 className="font-playfair text-2xl md:text-3xl font-bold text-charcoal flex-1">
              {property.title}
            </h1>
            {property.coup_de_coeur && (
              <Badge label="Coup de cœur" variant="warning" />
            )}
          </div>

          <p className="text-charcoal-light text-sm">{property.address}</p>

          <p className="text-charcoal leading-relaxed">{property.description}</p>

          <div className="bg-stone-50 rounded-xl p-6">
            <h2 className="font-playfair text-lg font-semibold text-charcoal mb-4">
              Caractéristiques
            </h2>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {details.map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs text-charcoal-light uppercase tracking-wide mb-1">
                    {label}
                  </dt>
                  <dd className="text-sm font-medium text-charcoal">{String(value)}</dd>
                </div>
              ))}
              {property.dpe_rating && (
                <div>
                  <dt className="text-xs text-charcoal-light uppercase tracking-wide mb-1">
                    DPE
                  </dt>
                  <dd>
                    <DpeBadge rating={property.dpe_rating} />
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {property.lat && property.lng && (
            <div className="rounded-xl overflow-hidden" style={{ height: 280 }}>
              <PropertyMap lat={property.lat} lng={property.lng} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-stone-100 rounded-xl p-6 shadow-sm sticky top-24">
            <p className="text-3xl font-bold text-terracotta mb-1">
              {formatPrice(property.price)}
            </p>
            <p className="text-sm text-charcoal-light mb-6">
              Prix de vente affiché
            </p>

            {canMakeOffer ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => setOfferOpen(true)}
              >
                Faire une offre
              </Button>
            ) : !user ? (
              <Link href="/login">
                <Button variant="secondary" size="lg" className="w-full">
                  Connectez-vous pour faire une offre
                </Button>
              </Link>
            ) : null}

            {property.agency && (
              <div className="mt-6 pt-6 border-t border-stone-100">
                <p className="text-xs text-charcoal-light uppercase tracking-wide mb-2">
                  Agence
                </p>
                <p className="font-medium text-charcoal text-sm">
                  {property.agency.name}
                </p>
                <p className="text-xs text-charcoal-light">
                  {property.agency.city}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <OfferModal
        propertyId={property.id}
        propertyTitle={property.title}
        open={offerOpen}
        onClose={() => setOfferOpen(false)}
      />
    </div>
  );
}
