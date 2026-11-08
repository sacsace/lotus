"use client";

import Link from "next/link";

type Props = {
  tenantSlug: string;
  brandName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

export function SiteFooter({ tenantSlug, brandName, phone, email, address }: Props) {
  const year = new Date().getFullYear();
  const p = `/${tenantSlug}`;
  const links = [
    { href: p, label: "호텔" },
    { href: `${p}/rooms`, label: "객실" },
    { href: `${p}/dining`, label: "다이닝" },
    { href: `${p}/services`, label: "서비스" },
    { href: `${p}/contact`, label: "문의" },
    { href: `${p}/book`, label: "예약" },
  ];
  const family = [
    { href: "https://www.mvsystem.in", label: "업무 통합 시스템 MVS" },
    { href: "https://www.heresnow.in", label: "GPS 기반 출퇴근 기록 시스템 HeresNow" },
    { href: "https://www.neocle.in", label: "수출입 전문기업 Neocle" },
    { href: "https://www.msventures.in", label: "비즈니스 컨설팅 MVS" },
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
        <p className="text-[11px] tracking-[0.18em] text-[#1b1d1f]/45">Family site</p>
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
      <p className="mt-2 text-xs tracking-[0.18em] text-[#1b1d1f]/45">© {year} {brandName}</p>
    </footer>
  );
}
