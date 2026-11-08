"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/components/language-provider";
import { SiteLogo } from "@/components/site-logo";

type Props = {
  tenantSlug: string;
  brandName: string;
  branchName?: string;
};

function isActivePath(path: string, href: string, homeHref: string) {
  if (href === homeHref) return path === href || path === `${href}/`;
  return path === href || path.startsWith(`${href}/`);
}

export function SiteHeader({ tenantSlug }: Props) {
  const { t } = useI18n();
  const p = `/${tenantSlug}`;
  const path = usePathname();
  const [open, setOpen] = useState(false);
  if (path === p || path === `${p}/`) return null;

  const links = [
    { href: p, label: t.nav.home },
    { href: `${p}/rooms`, label: t.nav.rooms },
    { href: `${p}/dining`, label: t.nav.dining },
    { href: `${p}/services`, label: t.nav.services },
    { href: `${p}/contact`, label: t.nav.contact },
  ];

  return (
    <header className="border-b border-[#f0eeea] bg-white">
      <div className="flex h-16 items-center justify-between gap-4 px-5 sm:px-8">
        <SiteLogo href={p} variant="header" />

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => {
            const active = isActivePath(path, l.href, p);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative pb-1 text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${
                  active ? "font-semibold text-[#1c1c1c]" : "text-[#2c2824] hover:text-[#8a8176]"
                }`}
              >
                {l.label}
                {active ? <span aria-hidden className="absolute inset-x-0 -bottom-0.5 h-px bg-[#1c1c1c]" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <Link href={`${p}/contact`} className="border border-[#1c1c1c] px-4 py-2 text-[13px] hover:bg-[#f4f6f7]">
            {t.nav.contact}
          </Link>
          <Link href={`${p}/book`} className="bg-[#1c1c1c] px-4 py-2 text-[13px] text-white hover:bg-[#333]">
            {t.nav.book}
          </Link>
        </div>

        <button
          type="button"
          className="px-2 py-2 text-sm text-[#1c1c1c] lg:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={t.nav.menu}
        >
          {open ? "×" : t.nav.menu}
        </button>
      </div>

      {open && (
        <nav className="border-t border-[#e4dfd8] bg-white px-5 py-4 lg:hidden">
          <div className="mb-3">
            <LanguageSwitcher />
          </div>
          {links.map((l) => {
            const active = isActivePath(path, l.href, p);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`block border-l-2 py-2.5 pl-3 text-sm ${
                  active ? "border-[#1c1c1c] font-semibold text-[#1c1c1c]" : "border-transparent text-[#2c2824]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link href={`${p}/book`} onClick={() => setOpen(false)} className="mt-3 inline-flex bg-[#1c1c1c] px-4 py-2.5 text-sm text-white">
            {t.nav.book}
          </Link>
        </nav>
      )}
    </header>
  );
}
