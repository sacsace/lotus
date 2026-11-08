"use client";

import Link from "next/link";
import { useI18n } from "@/components/language-provider";
import { SERVICE_IDS, type ServiceId } from "@/lib/i18n";

export function ServicesPageContent({ tenantSlug }: { tenantSlug: string }) {
  const p = `/${tenantSlug}`;
  const { t } = useI18n();

  return (
    <div className="bg-[#d5dee3] px-4 py-8 text-[#1b1d1f] sm:px-8 sm:py-12">
      <section className="mx-auto max-w-6xl bg-white px-5 py-8 sm:px-12 sm:py-12">
        <div className="flex items-end justify-between gap-6 border-b border-[#1b1d1f] pb-4">
          <p className="text-[11px] tracking-[0.22em] text-[#8b9398]">04 / Services</p>
          <h1 className="text-5xl font-bold leading-none tracking-[-0.06em] sm:text-7xl">서비스</h1>
        </div>
        <p className="mt-5 max-w-md whitespace-pre-line break-keep text-sm leading-6 text-[#5e676c]">{t.services.subtitle}</p>
        <div className="mt-10 grid gap-x-12 lg:grid-cols-2">
          {SERVICE_IDS.map((id, i) => {
            const item = t.services.items[id as ServiceId];
            return (
              <article key={id} id={id} className="border-t border-[#1b1d1f] py-5">
                <p className="text-[11px] tracking-[0.18em] text-[#8b9398]">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">{item.title}</h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#5e676c]">{item.desc}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-4 flex flex-col items-start justify-between gap-6 border-t border-[#1b1d1f] pt-6 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.04em]">{t.services.needHelp}</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#5e676c]">{t.services.needHelpDesc}</p>
          </div>
          <Link href={`${p}/contact`} className="text-[11px] tracking-[0.18em]">
            {t.home.contactUs}
          </Link>
        </div>
      </section>
    </div>
  );
}
