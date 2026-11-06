import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, createAdminJwt } from "@/lib/admin-auth";
import { isAdminRole } from "@/lib/rbac";
import { logAdminAction } from "@/lib/audit";

export async function POST(req: Request) {
  let body: { id?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON required" }, { status: 400 });
  }

  const id = (body.id ?? body.email)?.trim().toLowerCase();
  const password = body.password;

  if (!id || !password) {
    return NextResponse.json({ error: "ID and password required" }, { status: 400 });
  }

  let user = await prisma.adminUser.findUnique({ where: { email: id } });

  if (!user) {
    const legacy = process.env.LOTUS_ADMIN_PASSWORD;
    if (legacy && password === legacy && id === "root") {
      const hash = await bcrypt.hash(legacy, 10);
      user = await prisma.adminUser.upsert({
        where: { email: "root" },
        update: { passwordHash: hash, active: true, role: "SUPER_ADMIN" },
        create: {
          email: "root",
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
