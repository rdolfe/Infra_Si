"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PhotoGallery from "@/components/property/PhotoGallery";
import OfferModal from "@/components/offers/OfferModal";
import { DpeBadge, Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { auth } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PropertyDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  surface: number;
  rooms: number;
  type: string;
  category: string;
  address: string;
  lat: number | null;
  lng: number | null;
  dpe_rating: string | null;
  coup_de_coeur: boolean;
  status: string;
  floor: number | null;
  parking: boolean;
  cellar: boolean;
  garden: boolean;
  agent_id: string;
  agency_id: string;
  created_at: string;
  photos: { id: string; url: string; display_order: number }[];
  agency: { id: string; name: string; city: string; address: string } | null;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [offerOpen, setOfferOpen] = useState(false);
  const user = auth.getUser();

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/api/properties/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setProperty(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-content mx-auto px-4 py-16 text-center text-charcoal-light">
        Chargement…
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-content mx-auto px-4 py-16 text-center">
        <p className="text-xl font-semibold text-charcoal">Bien introuvable</p>
        <Link href="/listings" className="text-terracotta text-sm mt-2 inline-block hover:underline">
          Retour aux annonces
        </Link>
      </div>
    );
  }

  const canMakeOffer = user?.role === "client";

  const details: { label: string; value: string | number | boolean | null }[] = [
    { label: "Surface", value: `${property.surface} m²` },
    { label: "Pièces", value: property.rooms },
    { label: "Type", value: property.type },
    { label: "Catégorie", value: property.category },
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
        </div>

        {/* Sidebar */}
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
