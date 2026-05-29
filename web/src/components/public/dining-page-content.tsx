"use client";

import { useI18n } from "@/components/language-provider";
import { HotelImage, HotelPhotoFrame } from "@/components/hotel-image";
import { HOTEL_IMAGES } from "@/lib/hotel-images";

export function DiningPageContent({ breakfast, dinner }: { breakfast: string[]; dinner: string[] }) {
  const { t } = useI18n();

  return (
    <DiningPageInner breakfast={breakfast} dinner={dinner} t={t} />
  );
}

function DiningPageInner({
  breakfast,
  dinner,
  t,
}: {
  breakfast: string[];
  dinner: string[];
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <div className="bg-background">
      <section className="apple-surface px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="apple-eyebrow">{t.dining.label}</p>
          <h1 className="apple-headline mt-3">{t.dining.title}</h1>
          <p className="mt-4 max-w-2xl text-muted">{t.dining.subtitle}</p>
          <HotelPhotoFrame className="mt-10 aspect-[21/9] rounded-2xl shadow-luxury">
            <HotelImage src={HOTEL_IMAGES.food.dinner} alt={t.dining.title} fill variant="banner" priority />
          </HotelPhotoFrame>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <div className="grid items-stretch gap-10 lg:grid-cols-2">
          <MenuCard title={t.dining.breakfast} items={breakfast} image={HOTEL_IMAGES.food.breakfast} todayMenu={t.dining.todayMenu} />
          <MenuCard title={t.dining.dinner} items={dinner} image={HOTEL_IMAGES.food.dinner} todayMenu={t.dining.todayMenu} />
        </div>

        <div className="photo-grid mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {HOTEL_IMAGES.food.gallery.map((url) => (
            <HotelPhotoFrame key={url} className="aspect-square rounded-2xl shadow-luxury">
              <HotelImage src={url} alt={t.dining.galleryAlt} fill variant="food" />
            </HotelPhotoFrame>
          ))}
        </div>
      </section>
    </div>
  );
}

function MenuCard({ title, items, image, todayMenu }: { title: string; items: string[]; image: string; todayMenu: string }) {
  return (
    <article className="apple-card flex h-full flex-col overflow-hidden">
      <HotelPhotoFrame className="aspect-[4/3] w-full shrink-0">
        <HotelImage src={image} alt={title} fill variant="food" />
      </HotelPhotoFrame>
      <div className="flex flex-1 flex-col p-8">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-muted">{todayMenu}</p>
        <ul className="mt-6 space-y-2">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
