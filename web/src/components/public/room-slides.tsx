"use client";

import { useState } from "react";
import { HotelImage } from "@/components/hotel-image";

export function RoomSlides({
  images,
  alt = "객실",
  className = "aspect-[5/4]",
}: {
  images: readonly string[];
  alt?: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];
  const go = (step: number) => setIndex((i) => (i + step + images.length) % images.length);
  if (!current) return null;

  return (
    <div>
      <div className={`relative overflow-hidden bg-[#e7ecee] ${className}`}>
        <div
          className="flex h-full transition-transform duration-700 ease-in-out motion-reduce:transition-none"
          style={{
            width: `${images.length * 100}%`,
            transform: `translateX(-${(index * 100) / images.length}%)`,
          }}
        >
          {images.map((src, i) => (
            <div key={`${src}-${i}`} className="relative h-full shrink-0" style={{ width: `${100 / images.length}%` }}>
              <HotelImage src={src} alt={`${alt} ${i + 1}`} fill variant="room" sizes="(min-width: 1024px) 40vw, 100vw" />
            </div>
          ))}
        </div>
        {images.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="이전 사진"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 px-1 text-4xl leading-none text-white drop-shadow-[0_1px_2px_rgba(27,29,31,0.8)]"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="다음 사진"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 px-1 text-4xl leading-none text-white drop-shadow-[0_1px_2px_rgba(27,29,31,0.8)]"
            >
              ›
            </button>
          </>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="mt-3 flex items-center justify-between border-t border-[#1b1d1f] pt-3 text-[11px] tracking-[0.18em] text-[#8b9398]">
          <button type="button" onClick={() => go(-1)}>
            이전
          </button>
          <span className="tabular-nums text-[#1b1d1f]">
            {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </span>
          <button type="button" onClick={() => go(1)}>
            다음
          </button>
        </div>
      ) : null}
    </div>
  );
}
