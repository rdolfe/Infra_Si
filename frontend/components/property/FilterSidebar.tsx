"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";

const DPE_OPTIONS = ["A", "B", "C", "D", "E", "F", "G"];
const PROPERTY_TYPES = [
  { value: "apartment", label: "Appartement" },
  { value: "house", label: "Maison" },
  { value: "villa", label: "Villa" },
  { value: "studio", label: "Studio" },
  { value: "office", label: "Bureau" },
  { value: "retail", label: "Commerce" },
  { value: "warehouse", label: "Entrepôt" },
];

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(true);

  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") ?? "");
  const [minSurface, setMinSurface] = useState(searchParams.get("min_surface") ?? "");
  const [rooms, setRooms] = useState(searchParams.get("rooms") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [dpe, setDpe] = useState(searchParams.get("dpe_rating") ?? "");
  const [coupDeCoeur, setCoupDeCoeur] = useState(
    searchParams.get("coup_de_coeur") === "true"
  );

  function applyFilters() {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (minSurface) params.set("min_surface", minSurface);
    if (rooms) params.set("rooms", rooms);
    if (type) params.set("type", type);
    if (dpe) params.set("dpe_rating", dpe);
    if (coupDeCoeur) params.set("coup_de_coeur", "true");
    router.push(`/listings?${params.toString()}`);
  }

  function resetFilters() {
    setCity("");
    setMinPrice("");
    setMaxPrice("");
    setMinSurface("");
    setRooms("");
    setType("");
    setDpe("");
    setCoupDeCoeur(false);
    router.push("/listings");
  }

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-charcoal hover:bg-stone-50 transition-colors"
          aria-expanded={open}
        >
          <span>Filtres</span>
          <svg
            className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="px-4 pb-4 space-y-4 border-t border-stone-100 pt-4">
            {/* City */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-charcoal">Ville</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Paris, Lyon…"
                className="rounded-md border border-stone-200 px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            {/* Type */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-charcoal">Type de bien</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="rounded-md border border-stone-200 px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta"
              >
                <option value="">Tous</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price range */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-charcoal">Prix (€)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  min={0}
                  className="w-1/2 rounded-md border border-stone-200 px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  min={0}
                  className="w-1/2 rounded-md border border-stone-200 px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
            </div>

            {/* Surface */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-charcoal">Surface min (m²)</label>
              <input
                type="number"
                value={minSurface}
                onChange={(e) => setMinSurface(e.target.value)}
                placeholder="Ex: 50"
                min={0}
                className="rounded-md border border-stone-200 px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            {/* Rooms */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-charcoal">Pièces min</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRooms(rooms === String(n) ? "" : String(n))}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      rooms === String(n)
                        ? "bg-terracotta text-white border-terracotta"
                        : "border-stone-200 text-charcoal hover:border-terracotta"
                    }`}
                  >
                    {n}+
                  </button>
                ))}
              </div>
            </div>

            {/* DPE */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-charcoal">DPE</label>
              <div className="flex flex-wrap gap-1">
                {DPE_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setDpe(dpe === r ? "" : r)}
                    className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                      dpe === r
                        ? "bg-terracotta text-white"
                        : "bg-stone-100 text-charcoal hover:bg-stone-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Coup de cœur */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={coupDeCoeur}
                onChange={(e) => setCoupDeCoeur(e.target.checked)}
                className="rounded border-stone-300 text-terracotta focus:ring-terracotta"
              />
              <span className="text-sm text-charcoal">Coup de cœur uniquement</span>
            </label>

            <div className="flex gap-2 pt-2">
              <Button variant="primary" size="sm" onClick={applyFilters} className="flex-1">
                Appliquer
              </Button>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Réinitialiser
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
