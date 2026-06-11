import { notFound } from "next/navigation";
import PropertyDetailClient from "./PropertyDetailClient";

const API_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface PropertyDetail {
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

export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const res = await fetch(`${API_URL}/api/properties/${params.id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) notFound();
  const property: PropertyDetail = await res.json();
  return <PropertyDetailClient property={property} />;
}
