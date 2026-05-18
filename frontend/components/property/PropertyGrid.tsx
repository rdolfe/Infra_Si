import PropertyCard, { PropertySummary } from "@/components/property/PropertyCard";
import Link from "next/link";

interface PropertyGridProps {
  properties: PropertySummary[];
  total: number;
  page: number;
  limit: number;
  searchParams: Record<string, string | string[] | undefined>;
}

function buildPageUrl(
  searchParams: Record<string, string | string[] | undefined>,
  newPage: number
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page") continue;
    if (value !== undefined) params.set(key, String(value));
  }
  params.set("page", String(newPage));
  return `/listings?${params.toString()}`;
}

export default function PropertyGrid({
  properties,
  total,
  page,
  limit,
  searchParams,
}: PropertyGridProps) {
  const totalPages = Math.ceil(total / limit);

  if (properties.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
        <svg
          className="w-12 h-12 text-stone-300 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <p className="font-playfair text-xl font-semibold text-charcoal mb-1">
          Aucun bien trouvé
        </p>
        <p className="text-charcoal-light text-sm">
          Modifiez vos filtres pour élargir la recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      <p className="text-sm text-charcoal-light mb-4">
        {total} bien{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          className="mt-10 flex items-center justify-center gap-2"
          aria-label="Pagination"
        >
          {page > 1 && (
            <Link
              href={buildPageUrl(searchParams, page - 1)}
              className="px-3 py-2 rounded-md text-sm border border-stone-200 text-charcoal hover:bg-stone-100 transition-colors"
            >
              ← Précédent
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - page) <= 2)
            .map((p) => (
              <Link
                key={p}
                href={buildPageUrl(searchParams, p)}
                className={`px-3 py-2 rounded-md text-sm border transition-colors ${
                  p === page
                    ? "bg-terracotta text-white border-terracotta"
                    : "border-stone-200 text-charcoal hover:bg-stone-100"
                }`}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </Link>
            ))}
          {page < totalPages && (
            <Link
              href={buildPageUrl(searchParams, page + 1)}
              className="px-3 py-2 rounded-md text-sm border border-stone-200 text-charcoal hover:bg-stone-100 transition-colors"
            >
              Suivant →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
