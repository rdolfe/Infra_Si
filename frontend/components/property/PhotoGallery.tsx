"use client";

import { useState } from "react";
import Image from "next/image";

interface Photo {
  id: string;
  url: string;
  display_order: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function resolveUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_URL}${url}`;
}

export default function PhotoGallery({
  photos,
  title,
}: {
  photos: Photo[];
  title: string;
}) {
  const [current, setCurrent] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="w-full aspect-video bg-stone-100 rounded-xl flex items-center justify-center">
        <span className="text-charcoal-light text-sm">Aucune photo disponible</span>
      </div>
    );
  }

  const prev = () => setCurrent((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setCurrent((i) => (i + 1) % photos.length);

  return (
    <div
      className="relative w-full aspect-video bg-stone-100 rounded-xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
      tabIndex={0}
      aria-label={`Galerie de photos — photo ${current + 1} sur ${photos.length}`}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
      }}
    >
      <Image
        key={photos[current].id}
        src={resolveUrl(photos[current].url)}
        alt={`${title} — photo ${current + 1}`}
        fill
        sizes="(max-width: 1024px) 100vw, 66vw"
        className="object-cover"
        priority={current === 0}
      />

      {photos.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Photo précédente"
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-charcoal/60 hover:bg-charcoal/80 text-white rounded-full p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Photo suivante"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-charcoal/60 hover:bg-charcoal/80 text-white rounded-full p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Aller à la photo ${i + 1}`}
                className={`w-2 h-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  i === current ? "bg-white" : "bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          <div className="absolute top-3 right-3 bg-charcoal/60 text-white text-xs px-2 py-1 rounded-full">
            {current + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  );
}
