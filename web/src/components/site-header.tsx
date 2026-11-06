"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SiteLogo } from "@/components/site-logo";

type Props = {
  tenantSlug: string;
  brandName: string;
  branchName?: string;
};

export function SiteHeader({ tenantSlug }: Props) {
  const p = `/${tenantSlug}`;
  const path = usePathname();
  const [open, setOpen] = useState(false);
  if (path === p || path === `${p}/`) return null;

  const links = [
    { href: p, label: "호텔" },
    { href: `${p}/rooms`, label: "객실" },
    { href: `${p}/dining`, label: "다이닝" },
    { href: `${p}/services`, label: "서비스" },
    { href: `${p}/contact`, label: "문의" },
  ];

  return (
    <header className="border-b border-[#f0eeea] bg-white">
      <div className="flex h-16 items-center justify-between gap-4 px-5 sm:px-8">
        <SiteLogo href={p} variant="header" />

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] text-[#2c2824] hover:text-[#8a8176] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href={`${p}/contact`} className="border border-[#1c1c1c] px-4 py-2 text-[13px] hover:bg-[#f4f6f7]">
            문의
          </Link>
          <Link href={`${p}/book`} className="bg-[#1c1c1c] px-4 py-2 text-[13px] text-white hover:bg-[#333]">
            예약하기
          </Link>
        </div>

        <button
          type="button"
          className="px-2 py-2 text-sm text-[#1c1c1c] lg:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        >
          {open ? "닫기" : "메뉴"}
        </button>
      </div>

      {open && (
        <nav className="border-t border-[#e4dfd8] bg-white px-5 py-4 lg:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2.5 text-sm">
              {l.label}
            </Link>
          ))}
          <Link href={`${p}/book`} onClick={() => setOpen(false)} className="mt-3 inline-flex bg-[#1c1c1c] px-4 py-2.5 text-sm text-white">
            예약하기
          </Link>
        </nav>
      )}
    </header>
  );
}
