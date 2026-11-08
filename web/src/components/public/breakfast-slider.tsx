"use client";

import { useEffect, useState } from "react";
import { formatMsg, useI18n } from "@/components/language-provider";
import { HotelImage, HotelPhotoFrame } from "@/components/hotel-image";

export function BreakfastSlider({
  images,
  className = "aspect-[4/3]",
}: {
  images: readonly string[];
  className?: string;
}) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (focus !== null) setFocus(null);
        else setOpen(false);
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, focus]);

  const current = images[index] ?? images[0];
  const go = (step: number) => setIndex((i) => (i + step + images.length) % images.length);

  useEffect(() => {
    if (!current || images.length < 2 || open || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => go(1), 4500);
    return () => window.clearInterval(id);
  }, [current, images.length, open, paused]);

  if (!current) return null;

  return (
    <>
      <div>
        <div
          className={`relative overflow-hidden bg-[#e7ecee] ${className}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="flex h-full transition-transform duration-700 ease-in-out motion-reduce:transition-none"
            style={{
              width: `${images.length * 100}%`,
              transform: `translateX(-${(index * 100) / images.length}%)`,
            }}
          >
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                className="relative h-full shrink-0 cursor-pointer"
                style={{ width: `${100 / images.length}%` }}
                onClick={() => {
                  setFocus(null);
                  setOpen(true);
                }}
                aria-label={t.dining.viewAll}
              >
                <HotelImage
                  src={src}
                  alt={formatMsg(t.dining.photoAlt, { n: i + 1 })}
                  fill
                  variant="food"
                  sizes="(min-width: 1024px) 55vw, 100vw"
                />
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4 border-t border-[#1b1d1f] pt-3 text-[11px] tracking-[0.16em]">
          <button type="button" onClick={() => setOpen(true)}>
            {t.dining.viewAll}
          </button>
          {images.length > 1 ? (
            <div className="flex items-center gap-4">
              <button type="button" aria-label={t.home.prevPhoto} onClick={() => go(-1)}>
                {t.common.prev}
              </button>
              <span className="tabular-nums text-[#8b9398]">
                {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </span>
              <button type="button" aria-label={t.home.nextPhoto} onClick={() => go(1)}>
                {t.common.next}
              </button>
            </div>
          ) : null}
        </div>
        {images.length > 1 ? (
          <div className="mt-4 grid grid-cols-4 gap-1.5 sm:grid-cols-8">
            {images.slice(Math.floor(index / 8) * 8, Math.floor(index / 8) * 8 + 8).map((src, offset) => {
              const i = Math.floor(index / 8) * 8 + offset;
              const active = i === index;
              return (
                <button
                  key={src}
                  type="button"
                  aria-label={formatMsg(t.dining.photoAlt, { n: i + 1 })}
                  aria-current={active ? "true" : undefined}
                  onClick={() => setIndex(i)}
                  className={`relative aspect-square overflow-hidden bg-[#e7ecee] ${active ? "outline outline-2 outline-offset-2 outline-[#1b1d1f]" : ""}`}
                >
                  <HotelImage src={src} alt="" fill variant="food" sizes="80px" />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {open ? (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#f3f0ea]">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#ddd6cc] bg-[#f3f0ea] px-5 py-4 sm:px-8">
            <p className="text-sm">{formatMsg(t.dining.galleryCount, { count: images.length })}</p>
            <button type="button" className="text-sm underline underline-offset-4" onClick={() => setOpen(false)}>
              {t.dining.close}
            </button>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2 p-4 sm:grid-cols-3 sm:p-8">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={() => setFocus(i)}
                aria-label={formatMsg(t.dining.photoAlt, { n: i + 1 })}
              >
                <HotelPhotoFrame className="aspect-[4/3]">
                  <HotelImage
                    src={src}
                    alt={formatMsg(t.dining.photoAlt, { n: i + 1 })}
                    fill
                    variant="food"
                    sizes="(min-width: 1024px) 33vw, 50vw"
                  />
                </HotelPhotoFrame>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {open && focus !== null ? (
        <button
          type="button"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#171717]/90 p-4"
          onClick={() => setFocus(null)}
          aria-label={t.dining.close}
        >
          <span className="relative block h-[85vh] w-full max-w-5xl">
            <HotelImage
              src={images[focus]}
              alt={formatMsg(t.dining.photoAlt, { n: focus + 1 })}
              fill
              variant="food"
              sizes="90vw"
              className="!object-contain"
            />
          </span>
        </button>
      ) : null}
    </>
  );
}
