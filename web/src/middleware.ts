import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { detectBrowserLocale, isLocale } from "@/lib/i18n/locale";

const LOCALE_COOKIE = "lotus-locale";

function withLocaleCookie(req: NextRequest, res: NextResponse) {
  const existing = req.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(existing)) return res;
  const locale = detectBrowserLocale(req.headers.get("accept-language"));
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return withLocaleCookie(req, NextResponse.next());
  }
  if (pathname.startsWith("/admin/login")) {
    return withLocaleCookie(req, NextResponse.next());
  }

  const token = req.cookies.get("lotus_admin")?.value;
  if (!token) {
    return withLocaleCookie(req, NextResponse.redirect(new URL("/admin/login", req.url)));
  }
  try {
    const secret = new TextEncoder().encode(
      process.env.LOTUS_ADMIN_JWT_SECRET || "fallback-dev-only-32-characters!",
    );
    await jwtVerify(token, secret);
    return withLocaleCookie(req, NextResponse.next());
  } catch {
    return withLocaleCookie(req, NextResponse.redirect(new URL("/admin/login", req.url)));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|uploads/|icon-|apple-icon|opengraph-image|robots.txt|sitemap.xml|pages-sitemap.xml).*)"],
};
