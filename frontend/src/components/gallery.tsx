"use client";

import Image from "next/image";
import { useState } from "react";

type GalleryProps = {
  photos: string[];
  name: string;
  rounded?: boolean;
};

export function Gallery({ photos, name, rounded = false }: GalleryProps) {
  const [index, setIndex] = useState(0);
  const total = photos.length;
  const current = photos[index] ?? photos[0];

  function showPrevious() {
    setIndex((value) => (value - 1 + total) % total);
  }

  function showNext() {
    setIndex((value) => (value + 1) % total);
  }

  if (!current) {
    return null;
  }

  return (
    <div
      className={`relative overflow-hidden bg-zinc-100 ${rounded ? "aspect-[16/8] rounded-lg" : "h-[240px]"}`}
    >
      <Image
        src={current}
        alt={`${name} — foto ${index + 1} de ${total}`}
        fill
        className="object-cover"
        sizes={
          rounded
            ? "(max-width: 1152px) 100vw, 1152px"
            : "(max-width: 768px) 100vw, 600px"
        }
        unoptimized
      />
      <button
        type="button"
        aria-label="Foto anterior"
        onClick={showPrevious}
        className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-lg text-zinc-700 shadow"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Foto siguiente"
        onClick={showNext}
        className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-lg text-zinc-700 shadow"
      >
        ›
      </button>
      <span className="absolute right-3 bottom-3 rounded-full bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-white">
        {index + 1}/{total}
      </span>
    </div>
  );
}
