"use client";

import Link from "next/link";
import { RoomSlides } from "@/components/public/room-slides";
import { roomGalleryForCode } from "@/lib/hotel-images";

const ROOM_INTRO =
  "출장과 장기 체류에도 편안하게 머무실 수 있는 객실을 제공합니다. 기본 숙박 요금에는 조식과 석식, 객실 청소 및 일반 세탁 서비스가 포함되어 있습니다.";

export const ROOM_DESCRIPTION =
  "편안한 휴식과 업무를 위한 공간을 갖추고 있습니다. 객실 내 전용 욕실과 업무용 책상, 무료 Wi-Fi 등 투숙에 필요한 편의시설을 제공합니다. 기본 숙박 요금에는 조식과 석식이 포함됩니다.";

export const ROOM_AMENITIES = [
  "킹사이즈 침대",
  "거실 공간",
  "전용 욕실",
  "에어컨",
  "스마트 TV",
  "무료 Wi-Fi",
  "업무용 책상",
  "전기 주전자",
  "매일 객실 청소",
  "무료 세탁 서비스",
  "룸서비스",
  "장기 투숙 상담",
] as const;

export const ROOM_NOTE = "객실별 시설과 구조는 다를 수 있으니 예약 시 확인해 주세요.";

type RoomType = {
  id: string;
  code: string;
  nameKo: string;
  description: string | null;
  features: string | null;
  imageUrl: string | null;
  inventory: number;
  baseRate: number;
  gallery?: string[];
};

export function RoomsPageContent({ tenantSlug, roomTypes }: { tenantSlug: string; roomTypes: RoomType[] }) {
  const p = `/${tenantSlug}`;

  return (
    <div className="bg-[#d5dee3] px-4 py-8 text-[#1b1d1f] sm:px-8 sm:py-12">
      <section className="mx-auto max-w-6xl bg-white px-5 py-8 sm:px-12 sm:py-12">
        <div className="flex items-end justify-between gap-6 border-b border-[#1b1d1f] pb-4">
          <p className="text-[11px] tracking-[0.22em] text-[#8b9398]">02 / Rooms</p>
          <h1 className="text-5xl font-bold leading-none tracking-[-0.06em] sm:text-7xl">객실</h1>
        </div>
        <p className="mt-5 max-w-xl text-sm leading-6 text-[#5e676c]">{ROOM_INTRO}</p>

        <div className="mt-10 space-y-14">
          {roomTypes.map((room, i) => {
            const images = room.gallery?.length ? room.gallery : roomGalleryForCode(room.code, room.imageUrl);
            return (
              <article key={room.id} className="border-t border-[#1b1d1f] pt-8">
                <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
                  <RoomSlides images={images} alt="객실" />
                  <div>
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p className="text-[11px] tracking-[0.18em] text-[#8b9398]">{String(i + 1).padStart(2, "0")}</p>
                        <h2 className="mt-1 text-3xl font-bold tracking-[-0.04em]">객실 안내</h2>
                      </div>
                      <Link href={`${p}/book`} className="shrink-0 text-[11px] tracking-[0.18em]">
                        예약 문의
                      </Link>
                    </div>
                    <p className="mt-4 max-w-md text-sm leading-6 text-[#5e676c]">{ROOM_DESCRIPTION}</p>
                    <ul className="mt-6">
                      {ROOM_AMENITIES.map((feature) => (
                        <li key={feature} className="border-b border-[#e6ebed] py-2.5 text-sm text-[#5e676c]">
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 text-xs leading-5 text-[#8b9398]">{ROOM_NOTE}</p>
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
