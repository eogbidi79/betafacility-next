"use client";

import { useState } from "react";

export function Gallery({ photos, title }: { photos: string[]; title: string }) {
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-gray-100 text-5xl font-extrabold text-brand-600/30">
        Beta
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photos[active]} alt={title} className="h-full w-full object-cover" />
      </div>
      {photos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Photo ${i + 1}`}
              className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === active ? "border-brand-500" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
