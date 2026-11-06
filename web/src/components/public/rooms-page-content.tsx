"use client";

import { useState } from "react";
import Link from "next/link";
import { HotelImage } from "@/components/hotel-image";
import { formatMsg, useI18n } from "@/components/language-provider";
import { translateFeature } from "@/lib/i18n";
import { ROOM_FEATURES } from "@/lib/content";
import { roomGalleryForCode } from "@/lib/hotel-images";

type RoomType = {
  id: string;
  code: string;
  nameKo: string;
  description: string | null;
  features: string | null;
  imageUrl: string | null;
  inventory: number;
  baseRate: number;
};

export function RoomsPageContent({ tenantSlug, roomTypes }: { tenantSlug: string; roomTypes: RoomType[] }) {
  const p = `/${tenantSlug}`;
  const { t, locale } = useI18n();

  return (
    <div className="bg-[#d5dee3] px-4 py-8 text-[#1b1d1f] sm:px-8 sm:py-12">
      <section className="mx-auto max-w-6xl bg-white px-5 py-8 sm:px-12 sm:py-12">
        <div className="flex items-end justify-between gap-6 border-b border-[#1b1d1f] pb-4">
          <p className="text-[11px] tracking-[0.22em] text-[#8b9398]">02 / Rooms</p>
          <h1 className="text-5xl font-bold leading-none tracking-[-0.06em] sm:text-7xl">객실</h1>
        </div>
        <p className="mt-5 max-w-xl text-sm leading-6 text-[#5e676c]">
          M Room은 침실과 화장실 7실, B Room은 거실과 침실, 화장실 15실, S Room은 1실입니다. 기본 숙박에는 조식, 청소, 세탁이 포함됩니다.
        </p>

        <div className="mt-10 space-y-14">
          {roomTypes.map((room, i) => {
            const features: string[] = room.features ? JSON.parse(room.features) : ROOM_FEATURES;
            return (
              <article key={room.id} className="border-t border-[#1b1d1f] pt-8">
                <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
                  <RoomSlides images={roomGalleryForCode(room.code, room.imageUrl)} alt={room.nameKo} />
                  <div>
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p className="text-[11px] tracking-[0.18em] text-[#8b9398]">{String(i + 1).padStart(2, "0")}</p>
                        <h2 className="mt-1 text-3xl font-bold tracking-[-0.04em]">{room.nameKo}</h2>
                      </div>
                      <Link href={`${p}/book`} className="shrink-0 text-[11px] tracking-[0.18em]">
                        예약
                      </Link>
                    </div>
                    {room.description ? <p className="mt-4 max-w-md text-sm leading-6 text-[#5e676c]">{room.description}</p> : null}
                    <p className="mt-3 text-sm text-[#8b9398]">{formatMsg(t.common.unitsAvailable, { count: room.inventory })}</p>
                    <ul className="mt-6">
                      {features.map((feature) => (
                        <li key={feature} className="border-b border-[#e6ebed] py-2.5 text-sm text-[#5e676c]">
                          {translateFeature(feature, locale)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function RoomSlides({ images, alt }: { images: readonly string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];
  const go = (step: number) => setIndex((i) => (i + step + images.length) % images.length);
  if (!current) return null;

  return (
    <div>
      <div className="relative aspect-[5/4] overflow-hidden bg-[#e7ecee]">
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
