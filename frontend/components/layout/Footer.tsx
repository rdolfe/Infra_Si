"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/auth";

const ROLE_DASHBOARD: Record<string, string> = {
  client: "/dashboard",
  agent: "/agency/listings",
  admin: "/admin",
};

const DISCOVER_LINKS = [
  { label: "Annonces", href: "/listings" },
  { label: "Carte des prix", href: "/map" },
  { label: "Coups de cœur", href: "/listings?coup_de_coeur=true" },
];

const AGENCY_LINKS = [
  { label: "Paris", href: "/listings?city=Paris" },
  { label: "Lyon", href: "/listings?city=Lyon" },
  { label: "Marseille", href: "/listings?city=Marseille" },
  { label: "Bordeaux", href: "/listings?city=Bordeaux" },
];

export default function Footer() {
  const [user, setUser] = useState<{ role: string } | null>(null);

  useEffect(() => {
    setUser(auth.getUser());
  }, []);

  const accountLinks = user
    ? [{ label: "Mon espace", href: ROLE_DASHBOARD[user.role] ?? "/dashboard" }]
    : [
        { label: "Connexion", href: "/login" },
        { label: "Créer un compte", href: "/register" },
      ];

  const sections: { title: string; links: { label: string; href: string }[] }[] = [
    { title: "Découvrir", links: DISCOVER_LINKS },
    { title: "Mon compte", links: accountLinks },
    { title: "Agences", links: AGENCY_LINKS },
  ];

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

          {sections.map(({ title, links }) => (
            <div key={title}>
              <h3 className="font-inter font-semibold text-sm text-white/90 uppercase tracking-wider mb-3">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((item) => (
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
