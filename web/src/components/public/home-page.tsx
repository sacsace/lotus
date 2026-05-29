"use client";

import Link from "next/link";
import { HotelImage, HotelPhotoFrame } from "@/components/hotel-image";
import { motion } from "framer-motion";
import { HeroSlider } from "@/components/public/hero-slider";
import { MotionCard, MotionSection } from "@/components/public/motion-section";
import { formatMsg, useI18n } from "@/components/language-provider";
import { HOTEL_IMAGES, DEFAULT_ROOM_IMAGE } from "@/lib/hotel-images";
import type { Dictionary } from "@/lib/i18n";

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
  address?: string | null;
};

export function HomePage({ tenantSlug, heroImages, rooms, address }: Props) {
  const p = `/${tenantSlug}`;
  const { t } = useI18n();

  return (
    <>
      <HeroSlider slides={heroImages}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3 }}>
          <p className="text-sm font-medium text-white/80">{t.home.tagline}</p>
          <h1 className="mt-4 max-w-3xl whitespace-pre-line text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {t.home.heroTitle}
          </h1>
          <p className="mt-6 max-w-xl whitespace-pre-line text-lg text-white/70">{t.home.heroSubtitle}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Cta href={`${p}/book`} primary>{t.home.bookNow}</Cta>
            <Cta href={`${p}/contact`}>{t.home.contactUs}</Cta>
            <Cta href={`${p}/services#airport`}>{t.home.airportPickup}</Cta>
            <Cta href={`${p}/contact?type=longstay`}>{t.home.longStayInquiry}</Cta>
          </div>
        </motion.div>
      </HeroSlider>

      <MotionSection className="luxury-gradient px-4 py-24 sm:px-8">
        <HospitalitySection t={t} />
      </MotionSection>

      <MotionSection className="bg-card px-4 py-24 sm:px-8">
        <AirportSection p={p} t={t} />
      </MotionSection>

      <MotionSection className="px-4 py-24 sm:px-8">
        <RoomsSection rooms={rooms} p={p} t={t} />
      </MotionSection>

      <MotionSection className="bg-beige px-4 py-24 dark:bg-charcoal/30 sm:px-8">
        <TestimonialsSection t={t} />
      </MotionSection>

      <MotionSection className="px-4 py-24 sm:px-8">
        <LocationSection address={address} t={t} />
      </MotionSection>
    </>
  );
}

function HospitalitySection({ t }: { t: Dictionary }) {
  const items = [
    { title: t.home.featureCorporateTitle, desc: t.home.featureCorporateDesc },
    { title: t.home.featureDiningTitle, desc: t.home.featureDiningDesc },
    { title: t.home.featureLongStayTitle, desc: t.home.featureLongStayDesc },
  ];
  return (
    <div className="mx-auto max-w-7xl">
      <SectionLabel>{t.home.hospitalityLabel}</SectionLabel>
      <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">{t.home.hospitalityTitle}</h2>
      <p className="mt-6 max-w-3xl leading-relaxed text-muted">{t.home.hospitalityDesc}</p>
      <FeatureGrid items={items} />
    </div>
  );
}

function FeatureGrid({ items }: { items: { title: string; desc: string }[] }) {
  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-3">
      {items.map((item) => (
        <MotionCard key={item.title} className="apple-card p-8">
          <h3 className="text-xl font-semibold tracking-tight">{item.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">{item.desc}</p>
        </MotionCard>
      ))}
    </div>
  );
}
function AirportSection({ p, t }: { p: string; t: Dictionary }) {
  return (
    <div className="mx-auto max-w-7xl grid items-center gap-12 lg:grid-cols-2">
      <HotelPhotoFrame className="aspect-[4/3] rounded-2xl shadow-luxury">
        <HotelImage src={HOTEL_IMAGES.reception} alt={t.home.airportLabel} fill variant="card" />
      </HotelPhotoFrame>
      <div>
        <SectionLabel>{t.home.airportLabel}</SectionLabel>
        <h2 className="mt-3 font-display text-3xl font-semibold">{t.home.airportTitle}</h2>
        <p className="mt-4 leading-relaxed text-muted">{t.home.airportDesc}</p>
        <Link href={`${p}/services#airport`} className="mt-6 inline-block text-sm font-medium text-gold hover:underline">
          {t.common.learnMore}
        </Link>
      </div>
    </div>
  );
}

function RoomsSection({ rooms, p, t }: { rooms: RoomPreview[]; p: string; t: Dictionary }) {
  return (
    <div className="mx-auto max-w-7xl">
      <SectionLabel>{t.home.roomsLabel}</SectionLabel>
      <h2 className="mt-3 font-display text-3xl font-semibold">{t.home.roomsTitle}</h2>
      <div className="mt-10 grid items-stretch gap-8 md:grid-cols-3">
        {rooms.map((room) => (
          <MotionCard key={room.id} className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-luxury">
            <RoomImage room={room} />
            <RoomBody room={room} p={p} t={t} />
          </MotionCard>
        ))}
      </div>
    </div>
  );
}

function RoomBody({ room, p, t }: { room: RoomPreview; p: string; t: Dictionary }) {
  return (
    <div className="p-6">
      <h3 className="font-display text-xl font-semibold">{room.nameKo}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted">{room.description}</p>
      <p className="mt-4 text-sm font-medium text-gold">
        {formatMsg(t.common.from, { price: room.baseRate.toLocaleString() })} {t.common.perNight}
      </p>
      <Link href={`${p}/rooms`} className="mt-4 inline-block text-sm hover:underline">{t.common.viewDetails}</Link>
    </div>
  );
}

function RoomImage({ room }: { room: RoomPreview }) {
  return (
    <HotelPhotoFrame className="aspect-[4/3] w-full shrink-0">
      <HotelImage
        src={room.imageUrl ?? DEFAULT_ROOM_IMAGE}
        alt={room.nameKo}
        fill
        variant="room"
        className="transition duration-700 group-hover:scale-[1.06]"
      />
    </HotelPhotoFrame>
  );
}
function TestimonialsSection({ t }: { t: Dictionary }) {
  return (
    <div className="mx-auto max-w-7xl">
      <SectionLabel>{t.home.testimonialsLabel}</SectionLabel>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {t.testimonials.map((item) => (
          <blockquote key={item.name} className="rounded-2xl bg-card p-8 shadow-luxury">
            <p className="text-sm leading-relaxed text-muted">&ldquo;{item.quote}&rdquo;</p>
            <footer className="mt-6">
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-muted">{item.company}</p>
            </footer>
          </blockquote>
        ))}
      </div>
    </div>
  );
}

function LocationSection({ address, t }: { address?: string | null; t: Dictionary }) {
  return (
    <div className="mx-auto max-w-7xl">
      <SectionLabel>{t.home.locationLabel}</SectionLabel>
      <h2 className="mt-3 font-display text-3xl font-semibold">{t.home.locationTitle}</h2>
      <p className="mt-4 max-w-2xl text-muted">{address ?? t.home.locationFallback}</p>
      <div className="mt-8 aspect-[21/9] overflow-hidden rounded-2xl bg-beige shadow-luxury">
        <iframe title="Map" className="h-full w-full border-0" loading="lazy" src="https://maps.google.com/maps?q=Lotus+Korean+Hotel+Bengaluru&output=embed" />
      </div>
    </div>
  );
}

function Cta({ href, children, primary }: { href: string; children: React.ReactNode; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={
        primary
          ? "apple-btn-primary px-6 py-3"
          : "inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
      }
    >
      {children}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="apple-eyebrow">{children}</p>;
}
