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

export async function DELETE(req: Request) {
  if (!(await assertAdminCookie())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 401 });
  }
  const tenant = await getAdminTenant();
  if (!tenant) {
    return NextResponse.json({ error: "테넌트를 먼저 선택하세요." }, { status: 400 });
  }

  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON 필요" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id 필요" }, { status: 400 });

  const owned = await prisma.roomType.findFirst({ where: { id: body.id, tenantId: tenant.id } });
  if (!owned) return NextResponse.json({ error: "객실 유형을 찾지 못했습니다." }, { status: 404 });

  const reservations = await prisma.reservation.count({ where: { roomTypeId: owned.id } });
  if (reservations > 0) {
    return NextResponse.json({ error: "이 객실 유형으로 된 예약이 있어 삭제할 수 없습니다." }, { status: 409 });
  }

  const rooms = await prisma.room.findMany({ where: { roomTypeId: owned.id }, select: { id: true } });
  if (rooms.length) {
    await prisma.guest.updateMany({
      where: { roomId: { in: rooms.map((room) => room.id) } },
      data: { roomId: null, roomNumber: null },
    });
    await prisma.room.deleteMany({ where: { roomTypeId: owned.id } });
  }
  await prisma.roomType.delete({ where: { id: owned.id } });

  const roomTypes = await prisma.roomType.findMany({
    where: { tenantId: tenant.id },
    orderBy: { baseRate: "asc" },
  });
  return NextResponse.json({ ok: true, roomTypes });
}
