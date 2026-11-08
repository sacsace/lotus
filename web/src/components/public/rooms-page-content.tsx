"use client";

import Link from "next/link";
import { useI18n } from "@/components/language-provider";
import { RoomSlides } from "@/components/public/room-slides";
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
  gallery?: string[];
};

export function RoomsPageContent({ tenantSlug, roomTypes }: { tenantSlug: string; roomTypes: RoomType[] }) {
  const { t } = useI18n();
  const p = `/${tenantSlug}`;

  return (
    <div className="bg-[#d5dee3] px-4 py-8 text-[#1b1d1f] sm:px-8 sm:py-12">
      <section className="mx-auto max-w-6xl bg-white px-5 py-8 sm:px-12 sm:py-12">
        <div className="flex items-end justify-between gap-6 border-b border-[#1b1d1f] pb-4">
          <p className="text-[11px] tracking-[0.22em] text-[#8b9398]">{t.rooms.eyebrow}</p>
          <h1 className="text-5xl font-bold leading-none tracking-[-0.06em] sm:text-7xl">{t.rooms.title}</h1>
        </div>
        <p className="mt-5 max-w-xl break-keep text-sm leading-6 text-[#5e676c]">{t.rooms.intro}</p>

        <div className="mt-10 space-y-14">
          {roomTypes.map((room, i) => {
            const images = room.gallery?.length ? room.gallery : roomGalleryForCode(room.code, room.imageUrl);
            return (
              <article key={room.id} className="border-t border-[#1b1d1f] pt-8">
                <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
                  <RoomSlides images={images} alt={t.rooms.alt} />
                  <div>
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p className="text-[11px] tracking-[0.18em] text-[#8b9398]">{String(i + 1).padStart(2, "0")}</p>
                        <h2 className="mt-1 text-3xl font-bold tracking-[-0.04em]">{t.rooms.guideTitle}</h2>
                      </div>
                      <Link href={`${p}/book`} className="shrink-0 text-[11px] tracking-[0.18em]">
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
