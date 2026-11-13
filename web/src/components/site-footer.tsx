"use client";

import Link from "next/link";
import { useI18n } from "@/components/language-provider";

type Props = {
  tenantSlug: string;
  brandName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

export function SiteFooter({ tenantSlug, brandName, phone, email, address }: Props) {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  const p = `/${tenantSlug}`;
  const links = [
    { href: p, label: t.footer.hotel },
    { href: `${p}/rooms`, label: t.nav.rooms },
    { href: `${p}/dining`, label: t.nav.dining },
    { href: `${p}/services`, label: t.nav.services },
    { href: `${p}/contact`, label: t.nav.contact },
    { href: `${p}/book`, label: t.nav.book },
  ];
  const family = [
    { href: "https://www.mvsystem.in", label: t.footer.familyMvs },
    { href: "https://www.heresnow.in", label: t.footer.familyHeresnow },
    { href: "https://www.neocle.in", label: t.footer.familyNeocle },
    { href: "https://www.msventures.in", label: t.footer.familyMsv },
  ];

  return (
    <footer className="px-5 py-10 text-center text-[#1b1d1f]">
      <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-[#1b1d1f]/70">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="hover:text-[#1b1d1f]">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#1b1d1f]/60">
        {[phone, email, address].filter(Boolean).join(" · ")}
      </p>
      <div className="mx-auto mt-8 max-w-3xl">
        <p className="text-[11px] tracking-[0.18em] text-[#1b1d1f]/45">{t.footer.relatedSites}</p>
        <ul className="mt-3 flex flex-col items-center gap-2 text-sm text-[#1b1d1f]/70">
          {family.map((site) => (
            <li key={site.href}>
              <a href={site.href} target="_blank" rel="noopener noreferrer" className="hover:text-[#1b1d1f]">
                {site.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-8 text-xs tracking-[0.08em] text-[#1b1d1f]/45">
        Developed by{" "}
        <a href="https://www.msventures.in" target="_blank" rel="noopener noreferrer" className="hover:text-[#1b1d1f]">
          Minsub Ventures
        </a>
      </p>
      <p className="mt-2 text-xs tracking-[0.18em] text-[#1b1d1f]/45">
        © {year} {brandName}
      </p>
    </footer>
  );
}
