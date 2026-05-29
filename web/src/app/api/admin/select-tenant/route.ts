import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdminCookie, ADMIN_TENANT_COOKIE } from "@/lib/admin-api";

export async function POST(req: Request) {
  if (!(await assertAdminCookie())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 401 });
  }
  let body: { slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON 필요" }, { status: 400 });
  }
  const slug = body.slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: "slug 필요" }, { status: 400 });
  }
  const t = await prisma.tenant.findUnique({ where: { slug } });
  if (!t) {
    return NextResponse.json({ error: "테넌트 없음" }, { status: 404 });
  }
  const res = NextResponse.json({ ok: true, slug: t.slug, nameKo: t.nameKo });
  res.cookies.set({
    name: ADMIN_TENANT_COOKIE,
    value: t.slug,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}
