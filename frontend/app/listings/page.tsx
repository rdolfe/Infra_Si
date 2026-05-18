import { Suspense } from "react";
import FilterSidebar from "@/components/property/FilterSidebar";
import PropertyGrid from "@/components/property/PropertyGrid";
import { PropertySummary } from "@/components/property/PropertyCard";
import { SERVER_API_URL } from "@/lib/server-fetch";

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

function getString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

async function fetchListings(searchParams: SearchParams): Promise<{
  items: PropertySummary[];
  total: number;
  page: number;
  limit: number;
}> {
  const params = new URLSearchParams();
  const mappings: [string, string | string[] | undefined][] = [
    ["city", searchParams.city],
    ["type", searchParams.type],
    ["min_price", searchParams.min_price],
    ["max_price", searchParams.max_price],
    ["min_surface", searchParams.min_surface],
    ["rooms", searchParams.rooms],
    ["dpe_rating", searchParams.dpe_rating],
    ["coup_de_coeur", searchParams.coup_de_coeur],
    ["page", searchParams.page ?? "1"],
    ["limit", searchParams.limit ?? "20"],
  ];
  for (const [key, value] of mappings) {
    const v = getString(value);
    if (v) params.set(key, v);
  }
  params.set("prop_status", "published");

  try {
    const res = await fetch(`${SERVER_API_URL}/api/properties?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return { items: [], total: 0, page: 1, limit: 20 };
    return res.json();
  } catch {
    return { items: [], total: 0, page: 1, limit: 20 };
  }
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const data = await fetchListings(searchParams);
  const page = Number(getString(searchParams.page) ?? "1");
  const limit = Number(getString(searchParams.limit) ?? "20");

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <h1 className="font-playfair text-3xl font-bold text-charcoal mb-6">
        Annonces immobilières
      </h1>
      <div className="flex flex-col lg:flex-row gap-6">
        <Suspense>
          <FilterSidebar />
        </Suspense>
        <PropertyGrid
          properties={data.items}
          total={data.total}
          page={page}
          limit={limit}
          searchParams={searchParams as Record<string, string | string[] | undefined>}
        />
      </div>
    </div>
  );
}
