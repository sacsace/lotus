import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, createAdminJwt } from "@/lib/admin-auth";
import { isAdminRole } from "@/lib/rbac";
import { logAdminAction } from "@/lib/audit";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON required" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  let user = await prisma.adminUser.findUnique({ where: { email } });

  if (!user) {
    const legacy = process.env.LOTUS_ADMIN_PASSWORD;
    if (legacy && password === legacy && email === "admin@hotellotus.in") {
      const hash = await bcrypt.hash(legacy, 10);
      user = await prisma.adminUser.upsert({
        where: { email },
        update: { passwordHash: hash, active: true },
        create: {
          email,
          passwordHash: hash,
          name: "Super Admin",
          role: "SUPER_ADMIN",
        },
      });
    } else {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
  }

  if (!user.active) {
    return NextResponse.json({ error: "Account disabled" }, { status: 403 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (!isAdminRole(user.role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 500 });
  }

  const token = await createAdminJwt({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
  });

  await logAdminAction({
    adminUserId: user.id,
    action: "LOGIN",
    resource: "admin",
    ipAddress: req.headers.get("x-forwarded-for"),
  });

  const tenants = await prisma.tenant.findMany({
    orderBy: { nameKo: "asc" },
    select: { slug: true, nameKo: true, mvsEnabled: true, mvsCompanyId: true },
  });

  const res = NextResponse.json({
    ok: true,
    user: { name: user.name, email: user.email, role: user.role },
    tenants,
  });

  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return res;
}
