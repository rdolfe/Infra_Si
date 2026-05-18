"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Vue d'ensemble", exact: true },
  { href: "/admin/users", label: "Utilisateurs", exact: false },
  { href: "/admin/agencies", label: "Agences", exact: false },
  { href: "/admin/listings", label: "Annonces", exact: false },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-charcoal text-white flex flex-col">
        <div className="px-4 py-5 border-b border-white/10">
          <p className="text-xs uppercase tracking-widest text-white/50 mb-1">
            Administration
          </p>
          <p className="font-playfair font-semibold text-base">Ymmo Admin</p>
        </div>
        <nav className="flex-1 py-4" aria-label="Navigation admin">
          <ul className="space-y-0.5 px-2">
            {NAV_ITEMS.map(({ href, label, exact }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive(href, exact)
                      ? "bg-terracotta text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <Link
            href="/"
            className="text-xs text-white/50 hover:text-white transition-colors"
          >
            ← Retour au site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-stone-50 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
