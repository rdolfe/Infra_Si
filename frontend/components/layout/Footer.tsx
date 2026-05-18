import Link from "next/link";

const LINKS = {
  Découvrir: [
    { label: "Annonces", href: "/listings" },
    { label: "Carte des prix", href: "/map" },
    { label: "Coups de cœur", href: "/listings?coup_de_coeur=true" },
  ],
  "Mon compte": [
    { label: "Connexion", href: "/login" },
    { label: "Créer un compte", href: "/register" },
    { label: "Mon espace", href: "/dashboard" },
  ],
  Agences: [
    { label: "Paris", href: "/listings?city=Paris" },
    { label: "Lyon", href: "/listings?city=Lyon" },
    { label: "Marseille", href: "/listings?city=Marseille" },
    { label: "Bordeaux", href: "/listings?city=Bordeaux" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white mt-auto">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <p className="font-playfair text-2xl font-bold text-terracotta mb-2">
              Ymmo
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              Votre partenaire immobilier en France. 12 agences pour vous
              accompagner dans chaque projet.
            </p>
          </div>

          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <h3 className="font-inter font-semibold text-sm text-white/90 uppercase tracking-wider mb-3">
                {section}
              </h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Ymmo. Tous droits réservés.</p>
          <p>Siège social : Aix-en-Provence, France</p>
        </div>
      </div>
    </footer>
  );
}
