"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HotelImage } from "@/components/hotel-image";
import { BreakfastSlider } from "@/components/public/breakfast-slider";
import { HOTEL_IMAGES, DEFAULT_ROOM_IMAGE, defaultDiningGallery } from "@/lib/hotel-images";

type RoomPreview = {
  id: string;
  nameKo: string;
  description: string | null;
  imageUrl: string | null;
  baseRate: number;
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
  const slides = heroImages.length ? heroImages : [...HOTEL_IMAGES.hero];
  const foodSlides = diningGallery?.length ? diningGallery : defaultDiningGallery();
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const roomCards = rooms.length
    ? rooms
    : [
        { id: "m", nameKo: "M Room", description: "침실과 화장실로 구성되어 있습니다. 기본 숙박에는 조식, 청소, 세탁이 포함됩니다.", imageUrl: HOTEL_IMAGES.rooms.M, baseRate: 0 },
        { id: "b", nameKo: "B Room", description: "거실, 침실, 화장실로 구성되어 있습니다. 기본 숙박에는 조식, 청소, 세탁이 포함됩니다.", imageUrl: HOTEL_IMAGES.rooms.B, baseRate: 0 },
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
                    revealLeft ? "inset-y-0 left-[42%] right-0" : "inset-0"
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
          <div className="absolute inset-y-0 left-0 w-[42%] bg-[#1b1d1f]" />
          {slides.length > 1 ? (
            <div
              className="absolute bottom-8 right-5 z-20 flex items-center gap-3 sm:right-8"
              onMouseEnter={() => setHeroPaused(true)}
              onMouseLeave={() => setHeroPaused(false)}
            >
              <button
                type="button"
                aria-label="이전 사진"
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
                aria-label="다음 사진"
                onClick={() => goHero(1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 text-lg text-white hover:bg-white/15"
              >
                ›
              </button>
            </div>
          ) : null}
          <div className="relative z-10 flex h-full min-h-[640px] flex-col px-6 py-8 sm:px-10 sm:py-10">
            <p className="max-w-[calc(42%-2.5rem)] text-[11px] font-medium leading-snug tracking-[0.1em]">LOTUS KOREAN HOTEL</p>
            <div className="mt-auto max-w-xl">
              <div className="mb-5 h-px w-14 bg-white/45" />
              <p className="text-[11px] font-medium tracking-[0.22em] text-white/65">01 /</p>
              <h1 className="mt-2 text-[4.25rem] font-bold leading-[0.86] tracking-[-0.05em] sm:text-8xl lg:text-[6.5rem]">
                숙박을
                <br />
                예약하세요
              </h1>
            </div>
            <Link href="#rooms" className="mt-12 block w-fit">
              <p className="text-[11px] font-medium tracking-[0.22em] text-white/65">02 /</p>
              <p className="stroke-type mt-1 text-6xl font-bold leading-none tracking-[-0.05em] text-white/75 sm:text-7xl">객실</p>
            </Link>
          </div>
        </div>

        <div className="relative flex min-h-[640px] flex-col bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-10">
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link href={`${base}/rooms`}>객실</Link>
              <Link href={`${base}/dining`}>다이닝</Link>
              <Link href={`${base}/services`}>서비스</Link>
              <Link href={`${base}/contact`}>문의</Link>
            </nav>
            <div className="flex items-center gap-6 text-sm">
              <Link href={`${base}/book`} className="font-medium">
                예약
              </Link>
              <span className="text-[#8b9398]">한국어</span>
            </div>
          </div>

          <div className="relative">
            <p aria-hidden className="stroke-type pointer-events-none absolute right-6 top-2 text-7xl font-medium leading-none tracking-[-0.06em] text-[#d5dde1] sm:right-10 sm:text-8xl">
              01
            </p>
            <div className="grid border-t border-[#e6ebed] sm:grid-cols-2">
              <div className="border-b border-[#e6ebed] px-6 py-8 sm:border-b-0 sm:border-r sm:px-10">
                <p className="text-[11px] tracking-[0.16em] text-[#8b9398]">위치</p>
                <p className="mt-4 inline-block border-b border-[#1b1d1f] pb-0.5 text-sm font-medium">Bengaluru</p>
                {address ? <p className="mt-3 max-w-xs text-xs leading-5 text-[#6d757a]">{address}</p> : null}
              </div>
              <div className="px-6 py-8 sm:px-10">
                <p className="text-[11px] tracking-[0.16em] text-[#8b9398]">객실</p>
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
                <p className="mt-8 text-[11px] tracking-[0.16em] text-[#8b9398]">인원</p>
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
                <span className="text-[11px] tracking-[0.16em] text-[#8b9398]">도착</span>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="mt-4 block w-full bg-transparent text-sm font-medium outline-none"
                />
              </label>
              <label className="px-6 py-8 sm:px-10">
                <span className="text-[11px] tracking-[0.16em] text-[#8b9398]">출발</span>
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
              예약 가능 확인
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
            <p className="text-[11px] tracking-[0.22em] text-[#8b9398]">02 / Rooms</p>
            <h2 className="text-5xl font-bold leading-none tracking-[-0.06em] sm:text-7xl">객실</h2>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-6 text-[#5e676c]">
            출장과 장기 체류에도 편안하게 머무실 수 있는 객실을 제공합니다. 기본 숙박 요금에는 조식, 객실 청소 및 세탁 서비스가 포함되어 있습니다. 고등학생·대학생 특별 할인이 있습니다. 예약 요청을 보낼 때 해당 여부를 선택해 주세요.
          </p>
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            {roomCards.map((room, i) => (
              <article key={room.id}>
                <div className="relative aspect-[5/4] overflow-hidden bg-[#e7ecee]">
                  <HotelImage src={room.imageUrl ?? DEFAULT_ROOM_IMAGE} alt="객실" fill variant="room" sizes="(min-width: 1024px) 40vw, 100vw" />
                </div>
                <div className="mt-4 flex items-start justify-between gap-6 border-t border-[#1b1d1f] pt-3">
                  <div>
                    <p className="text-[11px] tracking-[0.18em] text-[#8b9398]">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="mt-1 text-2xl font-bold tracking-[-0.04em]">객실</h3>
                    <p className="mt-3 max-w-md text-sm leading-6 text-[#5e676c]">
                      편안한 휴식과 업무를 위한 공간을 갖추고 있습니다. 객실별 시설과 구조는 다를 수 있으니 예약 시 확인해 주세요.
                    </p>
                  </div>
                  <Link href={`${base}/book`} className="shrink-0 text-[11px] tracking-[0.18em]">
                    예약 문의
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="dining" className="bg-[#d5dee3] px-4 pb-8 sm:px-8 sm:pb-12">
        <div className="mx-auto max-w-6xl bg-white px-5 py-8 sm:px-12 sm:py-12">
          <div className="flex items-end justify-between gap-6 border-b border-[#1b1d1f] pb-4">
            <p className="text-[11px] tracking-[0.22em] text-[#8b9398]">03 / Dining</p>
            <h2 className="text-5xl font-bold leading-none tracking-[-0.06em] sm:text-7xl">한식</h2>
          </div>
          <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1.35fr_0.8fr]">
            <BreakfastSlider images={foodSlides} className="aspect-square sm:aspect-[5/4]" />
            <div>
              <p className="text-2xl font-bold leading-snug tracking-[-0.04em]">아침과 저녁, 정성껏 준비한 한식을 제공합니다</p>
              <p className="mt-4 text-sm leading-7 text-[#5e676c]">
                따뜻한 밥과 국, 다양한 반찬으로 든든한 한 끼를 준비합니다. 단체 식사는 예약 시 문의해 주세요.
              </p>
              <div id="services" className="mt-8 border-t border-[#1b1d1f]">
                <Note
                  index="01"
                  title="공항 픽업"
                  text="공항 픽업은 차량 1대당 USD 27입니다. 도착 시간과 항공편 정보를 알려주시면 공항에서 호텔까지 편안하게 모셔다드립니다."
                />
                <Note
                  index="02"
                  title="업무 환경"
                  text="객실에 책상과 Wi-Fi가 마련되어 있어 출장 중에도 편리하게 업무를 보실 수 있습니다."
                />
                <Note
                  index="03"
                  title="장기 투숙"
                  text="장기 투숙객을 위한 세탁 및 객실 청소 서비스를 제공합니다. FRRO 관련 절차와 C-Form에 대한 안내가 필요하시면 프런트로 문의해 주세요."
                />
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-[11px] tracking-[0.16em]">
                {phone || email ? <p className="normal-case tracking-normal text-sm text-[#5e676c]">{[phone, email].filter(Boolean).join(" · ")}</p> : <span />}
                <Link href={`${base}/dining`}>다이닝</Link>
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
