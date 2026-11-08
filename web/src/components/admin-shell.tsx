"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteLogo } from "@/components/site-logo";

const items = [
  { href: "/admin/dashboard", label: "대시보드" },
  { href: "/admin/guests", label: "고객 관리" },
  { href: "/admin/rooms", label: "객실 관리" },
  { href: "/admin/room-photos", label: "객실 사진" },
  { href: "/admin/pickups", label: "공항 픽업" },
  { href: "/admin/content", label: "콘텐츠 관리" },
  { href: "/admin/menu", label: "메뉴 관리" },
  { href: "/admin/rates", label: "요금 관리" },
  { href: "/admin/reservations", label: "예약 관리" },
  { href: "/admin/inquiries", label: "문의 관리" },
  { href: "/admin/tenant-settings", label: "지점 설정" },
  { href: "/admin/audit", label: "감사 로그" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row">
      <aside className="shrink-0 lg:w-56">
        <SiteLogo variant="footer" className="mb-1" />
        <p className="text-xs text-muted">운영 관리 시스템</p>
        <nav className="mt-6 flex flex-wrap gap-1 lg:flex-col">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                pathname === it.href || pathname.startsWith(`${it.href}/`)
                  ? "bg-gold text-white"
                  : "text-muted hover:bg-beige hover:text-foreground"
              }`}
            >
              {it.label}
            </Link>
          ))}
          <Link href="/admin/pick-tenant" className="rounded-lg px-3 py-2 text-sm text-gold hover:bg-beige">
            지점 변경
          </Link>
        </nav>
        <button type="button" onClick={() => void logout()} className="apple-btn-secondary mt-6 w-full py-2 text-left text-sm lg:w-auto">
          로그아웃
        </button>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
