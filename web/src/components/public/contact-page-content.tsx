"use client";

import Link from "next/link";
import { TenantInquiryWidget } from "@/components/tenant-widgets";
import { useI18n } from "@/components/language-provider";

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
  const rows = [
    phone ? { label: t.contact.phone, value: phone } : null,
    email ? { label: t.contact.email, value: email } : null,
    address ? { label: t.contact.address, value: address } : null,
  ].filter((row): row is { label: string; value: string } => Boolean(row));

  return (
    <div className="bg-[#d5dee3] px-4 py-8 text-[#1b1d1f] sm:px-8 sm:py-12">
      <section className="mx-auto max-w-6xl bg-white px-5 py-8 sm:px-12 sm:py-12">
        <div className="flex items-end justify-between gap-6 border-b border-[#1b1d1f] pb-4">
          <p className="text-[11px] tracking-[0.22em] text-[#8b9398]">05 / Contact</p>
          <h1 className="text-5xl font-bold leading-none tracking-[-0.06em] sm:text-7xl">{t.contact.title}</h1>
        </div>
        <p className="mt-5 max-w-md break-keep text-sm leading-6 text-[#5e676c]">{t.contact.subtitle}</p>
        <div className="mt-10 grid items-start gap-12 lg:grid-cols-2">
          <div>
            <div className="border-t border-[#1b1d1f]">
              {rows.map((row, i) => (
                <div key={row.label} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-[#e6ebed] py-4">
                  <p className="text-[11px] tracking-[0.14em] text-[#8b9398]">{String(i + 1).padStart(2, "0")}</p>
                  <div>
                    <h2 className="text-sm font-semibold tracking-[-0.02em]">{row.label}</h2>
                    <p className="mt-1 text-sm leading-6 text-[#5e676c]">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
            {digits ? (
              <Link
                href={`https://wa.me/${digits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block text-[11px] tracking-[0.18em]"
              >
                {t.contact.whatsapp}
              </Link>
            ) : null}
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.04em]">{t.contact.formTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-[#5e676c]">{t.contact.formSubtitle}</p>
            <div className="mt-6">
              <TenantInquiryWidget tenantSlug={tenantSlug} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-6xl bg-white">
        <div className="flex items-end justify-between gap-6 border-b border-[#1b1d1f] px-5 py-8 sm:px-12">
          <p className="text-[11px] tracking-[0.22em] text-[#8b9398]">06 / Map</p>
          <h2 className="text-5xl font-bold leading-none tracking-[-0.06em] sm:text-7xl">위치</h2>
        </div>
        <div className="aspect-[4/3] sm:aspect-[16/8]">
          <iframe
            title="호텔 위치"
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={mapEmbedUrl ?? "https://maps.google.com/maps?q=Lotus+Korean+Hotel+Bengaluru&output=embed"}
          />
        </div>
      </section>
    </div>
  );
}
