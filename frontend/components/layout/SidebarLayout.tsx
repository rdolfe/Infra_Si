"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface NavItem {
  href: string;
  label: string;
  exact: boolean;
}

interface SidebarLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
  subtitle: string;
  innerClassName?: string;
}

export default function SidebarLayout({
  children,
  navItems,
  title,
  subtitle,
  innerClassName,
}: SidebarLayoutProps) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
      {/* Mobile top nav */}
      <div className="lg:hidden bg-charcoal text-white">
        <div className="px-4 py-3 border-b border-white/10">
          <p className="font-playfair font-semibold text-sm">{title}</p>
        </div>
        <nav aria-label={`Navigation ${title.toLowerCase()}`} className="overflow-x-auto">
          <ul className="flex px-2 py-1 gap-1">
            {navItems.map(({ href, label, exact }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`block whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 bg-charcoal text-white flex-col">
        <div className="px-4 py-5 border-b border-white/10">
          <p className="text-xs uppercase tracking-widest text-white/50 mb-1">
            {subtitle}
          </p>
          <p className="font-playfair font-semibold text-base">{title}</p>
        </div>
        <nav className="flex-1 py-4" aria-label={`Navigation ${title.toLowerCase()}`}>
          <ul className="space-y-0.5 px-2">
            {navItems.map(({ href, label, exact }) => (
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

      <main className="flex-1 bg-stone-50 overflow-auto">
        {innerClassName ? (
          <div className={innerClassName}>{children}</div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
