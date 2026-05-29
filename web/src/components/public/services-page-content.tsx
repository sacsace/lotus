"use client";

import Link from "next/link";
import { useI18n } from "@/components/language-provider";
import { SERVICE_ICONS, SERVICE_IDS, type ServiceId } from "@/lib/i18n";

export function ServicesPageContent({ tenantSlug }: { tenantSlug: string }) {
  const p = `/${tenantSlug}`;
  const { t } = useI18n();

  return (
    <div className="bg-background">
      <section className="luxury-gradient px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">{t.services.label}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{t.services.title}</h1>
          <p className="mt-4 max-w-2xl text-muted">{t.services.subtitle}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_IDS.map((id) => {
            const item = t.services.items[id as ServiceId];
            return (
              <article key={id} id={id} className="rounded-2xl bg-card p-6 shadow-luxury transition hover:-translate-y-1">
                <span className="text-2xl text-gold">{SERVICE_ICONS[id]}</span>
                <h2 className="mt-4 font-display text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.desc}</p>
              </article>
            );
          })}
          <div className="col-span-full mt-8 rounded-2xl bg-charcoal p-8 text-white">
            <h3 className="font-display text-xl font-semibold">{t.services.needHelp}</h3>
            <p className="mt-2 text-sm text-white/70">{t.services.needHelpDesc}</p>
            <Link href={`${p}/contact`} className="mt-4 inline-block rounded-full bg-gold px-6 py-2 text-sm font-medium text-charcoal">
              {t.home.contactUs}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
