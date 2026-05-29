"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteLogo } from "@/components/site-logo";
import { useI18n } from "@/components/language-provider";

type Props = {
  tenantSlug: string;
  brandName: string;
  branchName?: string;
};

export function SiteHeader({ tenantSlug, brandName, branchName }: Props) {
  const p = `/${tenantSlug}`;
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const links = [
    { href: p, label: t.nav.home },
    { href: `${p}/rooms`, label: t.nav.rooms },
    { href: `${p}/dining`, label: t.nav.dining },
    { href: `${p}/services`, label: t.nav.services },
    { href: `${p}/contact`, label: t.nav.contact },
  ];

  return (
    <header className="glass-nav fixed top-0 z-50 w-full border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <SiteLogo href={p} branchName={branchName} variant="header" />

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                pathname === l.href ? "text-gold" : "text-muted hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link href={`${p}/book`} className="apple-btn-primary ml-3 px-5 py-2 text-sm">
            {t.nav.book}
          </Link>
          <LanguageSwitcher className="ml-2" />
          <button
            type="button"
            onClick={toggle}
            className="ml-1 rounded-lg px-2.5 py-2 text-sm text-muted transition hover:text-foreground"
            aria-label={t.nav.toggleTheme}
          >
            {theme === "light" ? "◐" : "◑"}
          </button>
        </nav>

        <button type="button" className="rounded-lg p-2 text-foreground lg:hidden" onClick={() => setOpen(!open)} aria-label={t.nav.menu}>
          <span className="text-xl">{open ? "×" : "☰"}</span>
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 py-4 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-2 py-2.5 text-sm ${pathname === l.href ? "text-gold" : "text-muted"}`}
            >
              {l.label}
            </Link>
          ))}
          <Link href={`${p}/book`} onClick={() => setOpen(false)} className="apple-btn-primary mt-3 inline-flex px-5 py-2 text-sm">
            {t.nav.book}
          </Link>
          <div className="mt-4">
            <LanguageSwitcher />
          </div>
        </nav>
      )}
    </header>
  );
}
