"use client";

import Link from "next/link";
import { HotelImage, HotelPhotoFrame } from "@/components/hotel-image";
import { formatMsg, useI18n } from "@/components/language-provider";
import { translateFeature } from "@/lib/i18n";
import { ROOM_FEATURES } from "@/lib/content";
import { HOTEL_IMAGES, roomImageForCode } from "@/lib/hotel-images";

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
    <div className="bg-background">
      <section className="apple-surface px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="apple-eyebrow">{t.rooms.label}</p>
          <h1 className="apple-headline mt-3">{t.rooms.title}</h1>
          <p className="mt-4 max-w-2xl text-muted">{t.rooms.subtitle}</p>
          <HotelPhotoFrame className="mt-10 aspect-[21/9] rounded-2xl shadow-luxury">
            <HotelImage src={HOTEL_IMAGES.reception} alt={t.rooms.title} fill variant="banner" priority />
          </HotelPhotoFrame>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <RoomsList p={p} roomTypes={roomTypes} t={t} locale={locale} />
      </section>
    </div>
  );
}

function RoomsList({
  p,
  roomTypes,
  t,
  locale,
}: {
  p: string;
  roomTypes: RoomType[];
  t: ReturnType<typeof useI18n>["t"];
  locale: ReturnType<typeof useI18n>["locale"];
}) {
  return (
    <div className="grid gap-10">
      {roomTypes.map((room) => {
        const features: string[] = room.features ? JSON.parse(room.features) : ROOM_FEATURES;
        return (
          <article key={room.id} className="overflow-hidden rounded-2xl bg-card shadow-luxury lg:grid lg:grid-cols-2 lg:items-stretch">
            <HotelPhotoFrame className="aspect-[4/3] lg:aspect-[4/3]">
              <HotelImage src={roomImageForCode(room.code, room.imageUrl)} alt={room.nameKo} fill variant="room" />
            </HotelPhotoFrame>
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <p className="text-xs uppercase tracking-widest text-gold">{room.code}</p>
              <h2 className="mt-2 font-display text-3xl font-semibold">{room.nameKo}</h2>
              <p className="mt-4 leading-relaxed text-muted">{room.description}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {features.map((f) => (
                  <li key={f} className="rounded-full bg-beige px-3 py-1 text-xs text-muted dark:bg-charcoal/50">
                    {translateFeature(f, locale)}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <p className="text-lg font-semibold text-gold">
                  {formatMsg(t.common.currencyNight, { price: room.baseRate.toLocaleString() })}
                </p>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {formatMsg(t.common.unitsAvailable, { count: room.inventory })}
                </span>
              </div>
              <Link href={`${p}/book`} className="mt-6 inline-flex w-fit rounded-full bg-charcoal px-6 py-3 text-sm font-medium text-white hover:bg-charcoal/90 dark:bg-gold dark:text-charcoal">
                {t.rooms.bookRoom}
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
