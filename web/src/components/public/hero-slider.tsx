"use client";

import { HotelImage } from "@/components/hotel-image";
import { useState } from "react";

type Slide = { url: string; alt: string };

export function HeroSlider({ slides, children }: { slides: Slide[]; children?: React.ReactNode }) {
  const [index, setIndex] = useState(0);
  const current = slides[index] ?? slides[0];

  if (!current) return null;

  const go = (step: number) => setIndex((i) => (i + step + slides.length) % slides.length);

  return (
    <section className="relative h-[72vh] min-h-[520px] bg-[#1c1c1c] lg:h-[979px]">
      <HotelImage
        key={current.url}
        src={current.url}
        alt={current.alt}
        fill
        priority
        variant="hero"
        sizes="100vw"
        quality={90}
        className="hero-photo-in"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 flex h-full items-center justify-center px-6 pb-24 text-center">{children}</div>
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="이전 사진"
            className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 text-lg text-white hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-6"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="다음 사진"
            className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 text-lg text-white hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6"
          >
            ›
          </button>
          <p className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2 text-xs tabular-nums tracking-widest text-white/80 sm:bottom-28">
            {index + 1} / {slides.length}
          </p>
        </>
      )}
    </section>
  );
}
