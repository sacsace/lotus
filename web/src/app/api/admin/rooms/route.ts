import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/admin-api";

export async function GET() {
  const session = await requirePermission("rooms:view");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jar = await (await import("next/headers")).cookies();
  const tenantSlug = jar.get("lotus_admin_tenant")?.value;
  if (!tenantSlug) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rooms = await prisma.room.findMany({
    where: { tenantId: tenant.id },
    include: {
      roomType: { select: { nameKo: true, code: true } },
      guest: { select: { guestName: true } },
    },
    orderBy: { roomNumber: "asc" },
  });

  return NextResponse.json({ rooms });
}

export async function PATCH(req: Request) {
  const session = await requirePermission("rooms:edit");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const room = await prisma.room.update({ where: { id }, data });
  return NextResponse.json({ ok: true, room });
}
