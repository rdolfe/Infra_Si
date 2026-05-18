import PropertyCard, { PropertySummary } from "@/components/property/PropertyCard";
import { SERVER_API_URL } from "@/lib/server-fetch";

const AGENCIES = [
  { name: "Ymmo Paris", city: "Paris" },
  { name: "Ymmo Lyon", city: "Lyon" },
  { name: "Ymmo Marseille", city: "Marseille" },
  { name: "Ymmo Bordeaux", city: "Bordeaux" },
  { name: "Ymmo Lille", city: "Lille" },
  { name: "Ymmo Toulouse", city: "Toulouse" },
  { name: "Ymmo Nice", city: "Nice" },
  { name: "Ymmo Nantes", city: "Nantes" },
  { name: "Ymmo Strasbourg", city: "Strasbourg" },
  { name: "Ymmo Rennes", city: "Rennes" },
  { name: "Ymmo Montpellier", city: "Montpellier" },
  { name: "Ymmo Aix-en-Provence", city: "Aix-en-Provence" },
];

async function getCoupDeCoeurProperties(): Promise<PropertySummary[]> {
  try {
    const res = await fetch(
      `${SERVER_API_URL}/api/properties?coup_de_coeur=true&limit=6&prop_status=published`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featuredProperties = await getCoupDeCoeurProperties();

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-charcoal text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: "url('https://picsum.photos/seed/ymmo-hero/1600/900')",
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-content mx-auto px-4 py-24 md:py-36 text-center">
          <h1 className="font-playfair text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Trouvez votre bien idéal
          </h1>
          <p className="text-lg md:text-xl text-stone-200 mb-10 max-w-xl mx-auto">
            Résidentiel, professionnel — des milliers d'annonces partout en France.
          </p>
          <form
            action="/listings"
            method="GET"
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
          >
            <input
              name="city"
              type="text"
              placeholder="Ville, code postal…"
              className="flex-1 rounded-md px-4 py-3 text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              aria-label="Ville ou code postal"
            />
            <select
              name="type"
              className="rounded-md px-4 py-3 text-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              aria-label="Type de bien"
            >
              <option value="">Tous types</option>
              <option value="apartment">Appartement</option>
              <option value="house">Maison</option>
              <option value="villa">Villa</option>
              <option value="studio">Studio</option>
              <option value="office">Bureau</option>
              <option value="retail">Commerce</option>
            </select>
            <button
              type="submit"
              className="bg-terracotta hover:bg-terracotta-dark text-white font-medium px-6 py-3 rounded-md transition-colors whitespace-nowrap"
            >
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* Coup de cœur */}
      {featuredProperties.length > 0 && (
        <section className="max-w-content mx-auto px-4 py-16">
          <h2 className="font-playfair text-3xl font-bold text-charcoal mb-2">
            Nos coups de cœur
          </h2>
          <p className="text-charcoal-light mb-8">
            Une sélection de biens d'exception choisis par nos agents.
          </p>
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
            {featuredProperties.map((property) => (
              <div
                key={property.id}
                className="snap-start shrink-0 w-72 sm:w-80"
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Nos agences */}
      <section className="bg-stone-100 py-16">
        <div className="max-w-content mx-auto px-4">
          <h2 className="font-playfair text-3xl font-bold text-charcoal mb-2">
            Nos agences
          </h2>
          <p className="text-charcoal-light mb-8">
            12 agences à travers la France pour vous accompagner.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {AGENCIES.map((agency) => (
              <div
                key={agency.city}
                className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg
                    className="w-5 h-5 text-terracotta"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-charcoal">{agency.name}</p>
                <p className="text-xs text-charcoal-light">{agency.city}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
