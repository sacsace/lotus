"use client";

import Link from "next/link";
import { TenantInquiryWidget } from "@/components/tenant-widgets";
import { useI18n } from "@/components/language-provider";
import { HOTEL_IMAGES } from "@/lib/hotel-images";
import { HotelImage, HotelPhotoFrame } from "@/components/hotel-image";

type Props = {
  tenantSlug: string;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  mapEmbedUrl?: string | null;
};

export function ContactPageContent({ tenantSlug, phone, email, whatsapp, address, mapEmbedUrl }: Props) {
  const { t } = useI18n();
  const digits = whatsapp?.replace(/\D/g, "") ?? "";

  return (
    <div className="bg-background">
      <section className="luxury-gradient px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{t.contact.label}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold">{t.contact.title}</h1>
          <p className="mt-4 max-w-2xl text-muted">{t.contact.subtitle}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <ContactInfo phone={phone} email={email} address={address} whatsapp={digits} t={t} />
            <HotelPhotoFrame className="aspect-[16/10] rounded-2xl shadow-luxury">
              <HotelImage src={HOTEL_IMAGES.reception} alt={t.contact.title} fill variant="card" />
            </HotelPhotoFrame>
            <div className="aspect-video overflow-hidden rounded-2xl shadow-luxury">
              <iframe title="Google Maps" className="h-full w-full border-0" loading="lazy" src={mapEmbedUrl ?? "https://maps.google.com/maps?q=Lotus+Korean+Hotel+Bengaluru&output=embed"} />
            </div>
          </div>
          <div className="rounded-2xl bg-card p-8 shadow-luxury">
            <h2 className="font-display text-lg font-semibold">{t.contact.formTitle}</h2>
            <p className="mt-2 text-sm text-muted">{t.contact.formSubtitle}</p>
            <div className="mt-6">
              <TenantInquiryWidget tenantSlug={tenantSlug} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactInfo({
  phone,
  email,
  address,
  whatsapp,
  t,
}: {
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  whatsapp: string;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-luxury">
      <h2 className="font-display text-lg font-semibold">{t.contact.infoTitle}</h2>
      <ul className="mt-4 space-y-3 text-sm text-muted">
        {phone && <li><strong className="text-foreground">{t.contact.phone}:</strong> {phone}</li>}
        {email && <li><strong className="text-foreground">{t.contact.email}:</strong> {email}</li>}
        {address && <li><strong className="text-foreground">{t.contact.address}:</strong> {address}</li>}
      </ul>
      {whatsapp && (
        <Link href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex rounded-full bg-[#25D366] px-5 py-2 text-sm font-medium text-white">
          {t.contact.whatsapp}
        </Link>
      )}
    </div>
  );
}
