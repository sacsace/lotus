"use client";

import { TenantBookingWidget } from "@/components/tenant-widgets";
import { useI18n } from "@/components/language-provider";

type Props = {
  tenantSlug: string;
  tenantName: string;
};

export function BookPageContent({ tenantSlug }: Props) {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      <p className="text-[11px] uppercase tracking-[0.28em] text-[#8a8176]">Book</p>
      <span className="mt-4 block h-px w-10 bg-[#a68456]" />
      <h1 className="mt-5 font-display text-4xl font-medium leading-[1.15] text-[#1c1c1c] sm:text-5xl">
        <span className="block">{t.pages.book.title}</span>
        <span className="block">Lotus Korean Hotel</span>
        <span className="block">Bengaluru, India</span>
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-[#6d675f]">{t.pages.book.subtitle}</p>
      <div className="mt-8">
        <TenantBookingWidget tenantSlug={tenantSlug} />
      </div>
    </div>
  );
}
