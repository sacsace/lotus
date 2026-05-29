import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdminCookie, getAdminTenant } from "@/lib/admin-api";

export async function GET() {
  if (!(await assertAdminCookie())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 401 });
  }
  const tenant = await getAdminTenant();
  if (!tenant) {
    const tenants = await prisma.tenant.findMany({
      orderBy: { nameKo: "asc" },
      select: { slug: true, nameKo: true },
    });
    return NextResponse.json({ error: "NO_TENANT", tenants }, { status: 400 });
  }
  const types = await prisma.roomType.findMany({
    where: { tenantId: tenant.id },
    orderBy: { baseRate: "asc" },
  });
  return NextResponse.json({
    tenant: { slug: tenant.slug, nameKo: tenant.nameKo, mvsCompanyId: tenant.mvsCompanyId },
    roomTypes: types,
  });
}

export async function PATCH(req: Request) {
  if (!(await assertAdminCookie())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 401 });
  }
  const tenant = await getAdminTenant();
  if (!tenant) {
    return NextResponse.json({ error: "테넌트를 먼저 선택하세요." }, { status: 400 });
  }

  let body: { updates?: { id: string; baseRate?: number; inventory?: number; nameKo?: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON 필요" }, { status: 400 });
  }
  if (!body.updates?.length) {
    return NextResponse.json({ error: "updates 배열 필요" }, { status: 400 });
  }

  for (const u of body.updates) {
    const owned = await prisma.roomType.findFirst({
      where: { id: u.id, tenantId: tenant.id },
    });
    if (!owned) continue;
    const data: { baseRate?: number; inventory?: number; nameKo?: string } = {};
    if (typeof u.baseRate === "number" && u.baseRate >= 0) data.baseRate = Math.floor(u.baseRate);
    if (typeof u.inventory === "number" && u.inventory >= 0) data.inventory = Math.floor(u.inventory);
    if (typeof u.nameKo === "string" && u.nameKo.trim()) data.nameKo = u.nameKo.trim();
    if (Object.keys(data).length) {
      await prisma.roomType.update({ where: { id: u.id }, data });
    }
  }

  const types = await prisma.roomType.findMany({
    where: { tenantId: tenant.id },
    orderBy: { baseRate: "asc" },
  });
  return NextResponse.json({
    ok: true,
    tenant: { slug: tenant.slug, nameKo: tenant.nameKo },
    roomTypes: types,
  });
}
