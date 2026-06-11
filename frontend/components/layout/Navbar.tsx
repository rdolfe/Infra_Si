"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import NotificationBell from "@/components/ui/NotificationBell";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, logout: authLogout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?city=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    authLogout();
    router.push("/");
  };

  const navLinkClass = (href: string) =>
    `text-sm font-inter px-2 py-1 transition-colors ${
      pathname === href
        ? "text-terracotta font-semibold"
        : "text-charcoal hover:text-terracotta"
    }`;

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
          <Link href="/listings" className={`hidden sm:inline ${navLinkClass("/listings")}`}>
            Annonces
          </Link>
          <Link href="/map" className={`hidden sm:inline ${navLinkClass("/map")}`}>
            Carte
          </Link>

          {user ? (
            <>
              <NotificationBell />
              {user.role === "client" && (
                <Link
                  href="/dashboard"
                  className={`hidden sm:inline ${navLinkClass("/dashboard")}`}
                >
                  Mon espace
                </Link>
              )}
              {user.role === "agent" && (
                <Link
                  href="/agency/listings"
                  className={`hidden sm:inline ${navLinkClass("/agency/listings")}`}
                >
                  Mes biens
                </Link>
              )}
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className={`hidden sm:inline ${navLinkClass("/admin")}`}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/login")}
                className="hidden sm:inline-flex"
              >
                Connexion
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push("/register")}
                className="hidden sm:inline-flex"
              >
                S&apos;inscrire
              </Button>
            </>
          )}

          {/* Hamburger — mobile only */}
          <button
            className="sm:hidden p-2 rounded-md text-charcoal hover:bg-stone-50 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed top-16 left-0 right-0 z-50 bg-white border-t border-stone-100 shadow-lg p-4 flex flex-col gap-1 sm:hidden">
            <form onSubmit={handleSearch} role="search" className="flex gap-2 mb-3">
              <label htmlFor="navbar-search-mobile" className="sr-only">
                Rechercher une ville
              </label>
              <input
                id="navbar-search-mobile"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ville, adresse…"
                className="flex-1 rounded-md border border-stone-200 px-3 py-2 text-sm font-inter text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
              <Button type="submit" size="sm" variant="primary" aria-label="Rechercher">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
              </Button>
            </form>

            <Link href="/listings" className={navLinkClass("/listings")}>Annonces</Link>
            <Link href="/map" className={navLinkClass("/map")}>Carte</Link>

            {user ? (
              <>
                {user.role === "client" && (
                  <Link href="/dashboard" className={navLinkClass("/dashboard")}>Mon espace</Link>
                )}
                {user.role === "agent" && (
                  <Link href="/agency/listings" className={navLinkClass("/agency/listings")}>Mes biens</Link>
                )}
                {user.role === "admin" && (
                  <Link href="/admin" className={navLinkClass("/admin")}>Admin</Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-left text-sm font-inter px-2 py-1 text-charcoal hover:text-terracotta transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <div className="flex gap-2 mt-2">
                <Button variant="ghost" size="sm" onClick={() => router.push("/login")} className="flex-1">
                  Connexion
                </Button>
                <Button variant="primary" size="sm" onClick={() => router.push("/register")} className="flex-1">
                  S&apos;inscrire
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
}
