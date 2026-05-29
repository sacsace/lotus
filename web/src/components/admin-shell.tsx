"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteLogo } from "@/components/site-logo";

const items = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/guests", label: "Guests" },
  { href: "/admin/rooms", label: "Rooms" },
  { href: "/admin/pickups", label: "Airport Pickups" },
  { href: "/admin/content", label: "Content CMS" },
  { href: "/admin/rates", label: "Rates" },
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/tenant-settings", label: "Settings" },
  { href: "/admin/audit", label: "Audit Log" },
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
        <p className="text-xs text-muted">Operations Platform</p>
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
            Switch Hotel
          </Link>
        </nav>
        <button type="button" onClick={() => void logout()} className="apple-btn-secondary mt-6 w-full py-2 text-left text-sm lg:w-auto">
          Logout
        </button>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
