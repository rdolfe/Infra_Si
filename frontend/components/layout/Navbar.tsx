"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import NotificationBell from "@/components/ui/NotificationBell";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";

export default function Navbar() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    setUser(auth.getUser());
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?city=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="bg-white border-b border-stone-100 sticky top-0 z-50">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4 justify-between">
        <Link
          href="/"
          className="font-playfair text-xl font-bold text-terracotta shrink-0"
        >
          Ymmo
        </Link>

        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-sm items-center gap-2"
          role="search"
        >
          <label htmlFor="navbar-search" className="sr-only">
            Rechercher une ville
          </label>
          <input
            id="navbar-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ville, adresse…"
            className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm font-inter text-charcoal placeholder:text-charcoal-light/60 focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-terracotta"
          />
          <Button type="submit" size="sm" variant="primary" aria-label="Rechercher">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
              />
            </svg>
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Link
            href="/listings"
            className="hidden sm:inline text-sm font-inter text-charcoal hover:text-terracotta transition-colors px-2 py-1"
          >
            Annonces
          </Link>
          <Link
            href="/map"
            className="hidden sm:inline text-sm font-inter text-charcoal hover:text-terracotta transition-colors px-2 py-1"
          >
            Carte
          </Link>

          {user ? (
            <>
              <NotificationBell />
              {user.role === "client" && (
                <Link
                  href="/dashboard"
                  className="hidden sm:inline text-sm font-inter text-charcoal hover:text-terracotta transition-colors px-2 py-1"
                >
                  Mon espace
                </Link>
              )}
              {user.role === "agent" && (
                <Link
                  href="/agency/listings"
                  className="hidden sm:inline text-sm font-inter text-charcoal hover:text-terracotta transition-colors px-2 py-1"
                >
                  Mes biens
                </Link>
              )}
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="hidden sm:inline text-sm font-inter text-charcoal hover:text-terracotta transition-colors px-2 py-1"
                >
                  Admin
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:inline-flex"
              >
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Connexion
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  S&apos;inscrire
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
