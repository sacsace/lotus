"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HotelImage } from "@/components/hotel-image";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/components/language-provider";
import { BreakfastSlider } from "@/components/public/breakfast-slider";
import { RoomSlides } from "@/components/public/room-slides";
import { HOTEL_IMAGES, defaultDiningGallery, roomGalleryForCode } from "@/lib/hotel-images";

type RoomPreview = {
  id: string;
  code?: string;
  nameKo: string;
  description: string | null;
  imageUrl: string | null;
  baseRate: number;
  gallery?: string[];
};

type Props = {
  tenantSlug: string;
  heroImages: { url: string; alt: string }[];
  rooms: RoomPreview[];
  diningGallery?: string[];
  address?: string | null;
  phone?: string | null;
  email?: string | null;
};

const COUNTS = ["1", "2", "3", "4+"] as const;

export function HomePage({ tenantSlug, heroImages, rooms, diningGallery, address, phone, email }: Props) {
  const { t } = useI18n();
  const slides = heroImages.length ? heroImages : [...HOTEL_IMAGES.hero];
  const foodSlides = diningGallery?.length ? diningGallery : defaultDiningGallery();
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const roomCards = rooms.length
    ? rooms
    : [
        {
          id: "m",
          code: "M",
          nameKo: "M Room",
          description: null,
          imageUrl: HOTEL_IMAGES.rooms.M,
          baseRate: 0,
          gallery: roomGalleryForCode("M", HOTEL_IMAGES.rooms.M),
        },
        {
          id: "b",
          code: "B",
          nameKo: "B Room",
          description: null,
          imageUrl: HOTEL_IMAGES.rooms.B,
          baseRate: 0,
          gallery: roomGalleryForCode("B", HOTEL_IMAGES.rooms.B),
        },
      ];
  const base = `/${tenantSlug}`;
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState<(typeof COUNTS)[number]>("2");
  const [roomCount, setRoomCount] = useState<(typeof COUNTS)[number]>("1");

  const goHero = (step: number) => setHeroIndex((i) => (i + step + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length < 2 || heroPaused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => goHero(1), 6500);
    return () => window.clearInterval(id);
  }, [heroPaused, slides.length]);

  const goBook = () => {
    const count = guests === "4+" ? "4" : guests;
    const rooms = roomCount === "4+" ? "4" : roomCount;
    const q = new URLSearchParams({ checkIn, checkOut, guests: count, rooms });
    window.location.assign(`${base}/book?${q.toString()}`);
  };

  return (
    <main className="bg-[#d5dee3] text-[#1b1d1f]">
      <section className="grid min-h-[100svh] lg:grid-cols-2">
        <div className="relative min-h-[640px] overflow-hidden bg-[#1b1d1f] text-white">
          <div className="absolute inset-0">
            {slides.map((slide, i) => {
              const revealLeft = slide.url.includes("reception-01");
              return (
                <div
                  key={slide.url}
                  className={`absolute transition-opacity duration-1000 ease-in-out ${
                    revealLeft ? "inset-y-0 left-[33.6%] right-0" : "inset-0"
                  } ${i === heroIndex ? "opacity-100" : "opacity-0"}`}
                >
                  <HotelImage
                    src={slide.url}
                    alt={slide.alt}
                    fill
                    priority={i === 0}
                    variant="hero"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    quality={90}
                    className={revealLeft ? "!object-[left_center]" : ""}
                  />
                </div>
              );
            })}
          </div>
          <div className="absolute inset-y-0 left-0 w-[33.6%] bg-[#1b1d1f]" />
          {slides.length > 1 ? (
            <div
              className="absolute bottom-8 right-5 z-20 flex items-center gap-3 sm:right-8"
              onMouseEnter={() => setHeroPaused(true)}
              onMouseLeave={() => setHeroPaused(false)}
            >
              <button
                type="button"
                aria-label={t.home.prevPhoto}
                onClick={() => goHero(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 text-lg text-white hover:bg-white/15"
              >
                ‹
              </button>
              <span className="text-xs tabular-nums text-white/80">
                {heroIndex + 1} / {slides.length}
              </span>
              <button
                type="button"
                aria-label={t.home.nextPhoto}
                onClick={() => goHero(1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 text-lg text-white hover:bg-white/15"
              >
                ›
              </button>
            </div>
          ) : null}
          <div className="relative z-10 flex h-full min-h-[640px] flex-col px-6 py-8 sm:px-10 sm:py-10">
            <p className="max-w-[calc(33.6%-2.5rem)] text-[11px] font-medium leading-snug tracking-[0.1em]">LOTUS KOREAN HOTEL</p>
            <div className="mt-auto max-w-xl">
              <div className="mb-5 h-px w-14 bg-white/45" />
              <p className="text-[11px] font-medium tracking-[0.22em] text-white/65">01 /</p>
              <h1 className="mt-2 text-[4.25rem] font-bold leading-[0.86] tracking-[-0.05em] sm:text-8xl lg:text-[6.5rem]">
                {t.home.heroBookLine1}
                <br />
                {t.home.heroBookLine2}
              </h1>
            </div>
            <Link href="#rooms" className="mt-12 block w-fit">
              <p className="text-[11px] font-medium tracking-[0.22em] text-white/65">02 /</p>
              <p className="stroke-type mt-1 text-6xl font-bold leading-none tracking-[-0.05em] text-white/75 sm:text-7xl">{t.nav.rooms}</p>
            </Link>
          </div>
        </div>

        <div className="relative flex min-h-[640px] flex-col bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-10">
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link href={`${base}/rooms`}>{t.nav.rooms}</Link>
              <Link href={`${base}/dining`}>{t.nav.dining}</Link>
              <Link href={`${base}/services`}>{t.nav.services}</Link>
              <Link href={`${base}/contact`}>{t.nav.contact}</Link>
            </nav>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Link href={`${base}/book`} className="font-medium">
                {t.nav.book}
              </Link>
              <LanguageSwitcher />
            </div>
          </div>

          <div className="relative">
            <p aria-hidden className="stroke-type pointer-events-none absolute right-6 top-2 text-7xl font-medium leading-none tracking-[-0.06em] text-[#d5dde1] sm:right-10 sm:text-8xl">
              01
            </p>
            <div className="grid border-t border-[#e6ebed] sm:grid-cols-2">
              <div className="border-b border-[#e6ebed] px-6 py-8 sm:border-b-0 sm:border-r sm:px-10">
                <p className="text-[11px] tracking-[0.16em] text-[#8b9398]">{t.home.locationLabel}</p>
                <p className="mt-4 inline-block border-b border-[#1b1d1f] pb-0.5 text-sm font-medium">Bengaluru</p>
                {address ? <p className="mt-3 max-w-xs text-xs leading-5 text-[#6d757a]">{address}</p> : null}
              </div>
              <div className="px-6 py-8 sm:px-10">
                <p className="text-[11px] tracking-[0.16em] text-[#8b9398]">{t.booking.roomCount}</p>
                <div className="mt-4 flex items-center gap-4">
                  {COUNTS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRoomCount(n)}
                      className={`flex h-8 min-w-8 items-center justify-center text-sm ${
                        roomCount === n ? "rounded-full bg-[#1b1d1f] px-2 text-white" : "text-[#1b1d1f]"
                      }`}
                      aria-pressed={roomCount === n}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="mt-8 text-[11px] tracking-[0.16em] text-[#8b9398]">{t.booking.guests}</p>
                <div className="mt-4 flex items-center gap-4">
                  {COUNTS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setGuests(n)}
                      className={`flex h-8 min-w-8 items-center justify-center text-sm ${
                        guests === n ? "rounded-full bg-[#1b1d1f] px-2 text-white" : "text-[#1b1d1f]"
                      }`}
                      aria-pressed={guests === n}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid border-t border-[#e6ebed] sm:grid-cols-2">
              <label className="border-b border-[#e6ebed] px-6 py-8 sm:border-b-0 sm:border-r sm:px-10">
                <span className="text-[11px] tracking-[0.16em] text-[#8b9398]">{t.booking.checkIn}</span>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="mt-4 block w-full bg-transparent text-sm font-medium outline-none"
                />
              </label>
              <label className="px-6 py-8 sm:px-10">
                <span className="text-[11px] tracking-[0.16em] text-[#8b9398]">{t.booking.checkOut}</span>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="mt-4 block w-full bg-transparent text-sm font-medium outline-none"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end border-t border-[#e6ebed]">
            <button type="button" onClick={goBook} className="bg-[#aebcc3] px-8 py-6 text-sm text-white hover:bg-[#9aadb6]">
              {t.home.checkAvailability}
              <span aria-hidden className="ml-3">
                ↓
              </span>
            </button>
          </div>
        </div>
      </section>

      <section id="rooms" className="bg-[#d5dee3] px-4 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-6xl bg-white px-5 py-8 sm:px-12 sm:py-12">
          <div className="flex items-end justify-between gap-6 border-b border-[#1b1d1f] pb-4">
            <p className="text-[11px] tracking-[0.22em] text-[#8b9398]">{t.rooms.eyebrow}</p>
            <h2 className="text-5xl font-bold leading-none tracking-[-0.06em] sm:text-7xl">{t.rooms.title}</h2>
          </div>
          <p className="mt-5 max-w-xl whitespace-pre-line break-keep text-sm leading-6 text-[#5e676c]">
            {t.rooms.intro}
          </p>
          <div className="mt-10 space-y-14">
            {roomCards.map((room, i) => {
              const images =
                room.gallery?.length
                  ? room.gallery
                  : roomGalleryForCode(room.code ?? "", room.imageUrl);
              return (
                <article key={room.id} className="border-t border-[#1b1d1f] pt-8">
                  <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
                    <RoomSlides images={images} alt={t.rooms.alt} />
                    <div>
                      <div className="flex items-start justify-between gap-6">
                        <div>
                          <p className="text-[11px] tracking-[0.18em] text-[#8b9398]">{String(i + 1).padStart(2, "0")}</p>
                          <h3 className="mt-1 text-3xl font-bold tracking-[-0.04em]">{t.rooms.guideTitle}</h3>
                        </div>
                        <Link href={`${base}/book`} className="shrink-0 text-[11px] tracking-[0.18em]">
                          {t.rooms.bookInquiry}
                        </Link>
                      </div>
                      <p className="mt-4 max-w-md break-keep text-sm leading-6 text-[#5e676c]">{t.rooms.description}</p>
                      <ul className="mt-6">
                        {t.rooms.amenities.map((feature) => (
                          <li key={feature} className="border-b border-[#e6ebed] py-2.5 text-sm text-[#5e676c]">
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-5 text-xs leading-5 text-[#8b9398]">{t.rooms.note}</p>
                      <Link href={`${base}/rooms`} className="mt-6 inline-block text-[11px] tracking-[0.18em]">
                        {t.rooms.viewMore}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="dining" className="bg-[#d5dee3] px-4 pb-8 sm:px-8 sm:pb-12">
        <div className="mx-auto max-w-6xl bg-white px-5 py-8 sm:px-12 sm:py-12">
          <div className="flex items-end justify-between gap-6 border-b border-[#1b1d1f] pb-4">
            <p className="text-[11px] tracking-[0.22em] text-[#8b9398]">03 / Dining</p>
            <h2 className="text-5xl font-bold leading-none tracking-[-0.06em] sm:text-7xl">{t.dining.title}</h2>
          </div>
          <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1.35fr_0.8fr]">
            <BreakfastSlider images={foodSlides} className="aspect-square sm:aspect-[5/4]" />
            <div>
              <p className="text-2xl font-bold leading-snug tracking-[-0.04em]">{t.home.diningHeadline}</p>
              <p className="mt-4 break-keep text-sm leading-7 text-[#5e676c]">{t.home.diningBody}</p>
              <div id="services" className="mt-8 border-t border-[#1b1d1f]">
                <Note index="01" title={t.home.noteAirportTitle} text={t.home.noteAirportText} />
                <Note index="02" title={t.home.noteWorkTitle} text={t.home.noteWorkText} />
                <Note index="03" title={t.home.noteLongstayTitle} text={t.home.noteLongstayText} />
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-[11px] tracking-[0.16em]">
                {phone || email ? <p className="normal-case tracking-normal text-sm text-[#5e676c]">{[phone, email].filter(Boolean).join(" · ")}</p> : <span />}
                <Link href={`${base}/dining`}>{t.nav.dining}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Note({ index, title, text }: { index: string; title: string; text: string }) {
  return (
    <div className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-[#e6ebed] py-4">
      <p className="text-[11px] tracking-[0.14em] text-[#8b9398]">{index}</p>
      <div>
        <h3 className="text-sm font-semibold tracking-[-0.02em]">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-[#5e676c]">{text}</p>
      </div>
    </div>
  );
}
