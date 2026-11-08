"use client";

import { useState } from "react";
import { useI18n } from "@/components/language-provider";
import { HotelImage } from "@/components/hotel-image";
import { formatHansikPrice, HANSIK_MENU_NOTE, type HansikMenuSection } from "@/lib/hansik-menu";
import { defaultDiningGallery, HOTEL_IMAGES } from "@/lib/hotel-images";

export function DiningPageContent({
  breakfast,
  dinner,
  menu,
  gallery,
}: {
  breakfast: string[];
  dinner: string[];
  menu: HansikMenuSection[];
  gallery?: string[];
}) {
  const { t } = useI18n();
  const breakfastItems = breakfast.length ? breakfast : t.dining.defaultItems;
  const dinnerItems = dinner.length ? dinner : t.dining.defaultItems;
  const slides = gallery?.length ? gallery : defaultDiningGallery();

  return (
    <div className="bg-[#d5dee3] px-4 py-8 text-[#1b1d1f] sm:px-8 sm:py-12">
      <section className="mx-auto max-w-6xl bg-white px-5 py-8 sm:px-12 sm:py-12">
        <div className="flex items-end justify-between gap-6 border-b border-[#1b1d1f] pb-4">
          <p className="text-[11px] tracking-[0.22em] text-[#8b9398]">03 / Dining</p>
          <h1 className="text-5xl font-bold leading-none tracking-[-0.06em] sm:text-7xl">한식</h1>
        </div>
        <p className="mt-5 max-w-md text-sm leading-6 text-[#5e676c]">
          조식과 석식, 정성껏 준비한 한식을 제공합니다. 따뜻한 밥과 국, 다양한 반찬으로 든든한 한 끼를 준비합니다.
        </p>
        <div className="mt-8">
          <DiningSlideshow images={slides} />
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-6xl bg-white px-5 py-8 sm:px-12 sm:py-12">
        <div className="flex items-end justify-between gap-6 border-b border-[#1b1d1f] pb-4">
          <p className="text-[11px] tracking-[0.22em] text-[#8b9398]">04 / Menu</p>
          <h2 className="text-5xl font-bold leading-none tracking-[-0.06em] sm:text-7xl">메뉴</h2>
        </div>
        <p className="mt-5 max-w-xl text-sm leading-6 text-[#5e676c]">{HANSIK_MENU_NOTE}</p>
        <div className="mt-10 grid gap-x-14 gap-y-12 lg:grid-cols-2">
          {menu.map((section) => (
            <article key={section.title} className={section.wide ? "lg:col-span-2" : undefined}>
              <div className="flex items-baseline justify-between gap-4 border-t border-[#1b1d1f] pt-3">
                <h3 className="text-2xl font-bold tracking-[-0.04em]">{section.title}</h3>
                <p className="text-[11px] tracking-[0.18em] text-[#8b9398]">{section.index}</p>
              </div>
              <ul className={section.wide ? "mt-2 sm:columns-2 sm:gap-x-14" : "mt-2"}>
                {section.items.map((item) => (
                  <li key={item.name} className="flex items-baseline justify-between gap-6 border-b border-[#e6ebed] py-2.5 break-inside-avoid">
                    <span className="text-sm">{item.name}</span>
                    <span className="shrink-0 text-sm tabular-nums text-[#5e676c]">{formatHansikPrice(item.price)}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-6xl bg-white px-5 py-8 sm:px-12 sm:py-12">
        <div className="grid gap-12 lg:grid-cols-2">
          <MenuBlock index="01" title={t.dining.breakfast} items={breakfastItems} image={HOTEL_IMAGES.food.breakfast} todayMenu={t.dining.todayMenu} />
          <MenuBlock index="02" title={t.dining.dinner} items={dinnerItems} image={HOTEL_IMAGES.food.dinner} todayMenu={t.dining.todayMenu} />
        </div>
      </section>
    </div>
  );
}

function DiningSlideshow({ images }: { images: readonly string[] }) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];
  const go = (step: number) => setIndex((i) => (i + step + images.length) % images.length);

  if (!current) return null;

  return (
    <div>
      <div className="relative aspect-square overflow-hidden bg-[#e7ecee] sm:aspect-[5/4]">
        <div
          className="flex h-full transition-transform duration-700 ease-in-out motion-reduce:transition-none"
          style={{
            width: `${images.length * 100}%`,
            transform: `translateX(-${(index * 100) / images.length}%)`,
          }}
        >
          {images.map((src, i) => (
            <div key={`${src}-${i}`} className="relative h-full shrink-0" style={{ width: `${100 / images.length}%` }}>
              <HotelImage src={src} alt={`다이닝 사진 ${i + 1}`} fill variant="food" sizes="(min-width: 1024px) 70vw, 100vw" priority={i === 0} />
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
        <div className="mt-3 flex items-center justify-end gap-4 border-t border-[#1b1d1f] pt-3 text-[11px] tracking-[0.16em]">
          <button type="button" aria-label="이전 사진" onClick={() => go(-1)}>
            이전
          </button>
          <span className="tabular-nums text-[#8b9398]">
            {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </span>
          <button type="button" aria-label="다음 사진" onClick={() => go(1)}>
            다음
          </button>
        </div>
      ) : null}
      <div className="mt-4 grid grid-cols-4 gap-1.5 sm:grid-cols-8">
        {images.map((src, i) => (
          <button
            key={`${src}-thumb-${i}`}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`다이닝 사진 ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            className={`relative aspect-square overflow-hidden bg-[#e7ecee] ${i === index ? "outline outline-2 outline-offset-2 outline-[#1b1d1f]" : ""}`}
          >
            <HotelImage src={src} alt="" fill variant="food" sizes="80px" />
          </button>
        ))}
      </div>
    </div>
  );
}

function MenuBlock({
  index,
  title,
  items,
  image,
  todayMenu,
}: {
  index: string;
  title: string;
  items: readonly string[];
  image: string;
  todayMenu: string;
}) {
  return (
    <article>
      <div className="relative aspect-[5/4] overflow-hidden bg-[#e7ecee]">
        <HotelImage src={image} alt={title} fill variant="food" sizes="(min-width: 1024px) 40vw, 100vw" />
      </div>
      <div className="mt-4 border-t border-[#1b1d1f] pt-3">
        <p className="text-[11px] tracking-[0.18em] text-[#8b9398]">{index}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">{title}</h2>
        <p className="mt-3 text-[11px] tracking-[0.16em] text-[#8b9398]">{todayMenu}</p>
        <ul className="mt-3 border-t border-[#e6ebed]">
          {items.map((item) => (
            <li key={item} className="border-b border-[#e6ebed] py-3 text-sm">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
