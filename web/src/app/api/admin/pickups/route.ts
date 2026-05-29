import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/admin-api";

export async function GET() {
  const session = await requirePermission("pickups:view");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jar = await (await import("next/headers")).cookies();
  const tenantSlug = jar.get("lotus_admin_tenant")?.value;
  if (!tenantSlug) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const pickups = await prisma.airportPickup.findMany({
    where: { tenantId: tenant.id },
    orderBy: { arrivalTime: "asc" },
    include: { guest: { select: { guestName: true } } },
  });

  return NextResponse.json({ pickups });
}

export async function POST(req: Request) {
  const session = await requirePermission("pickups:edit");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jar = await (await import("next/headers")).cookies();
  const tenantSlug = jar.get("lotus_admin_tenant")?.value;
  const tenant = tenantSlug ? await prisma.tenant.findUnique({ where: { slug: tenantSlug } }) : null;
  if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const body = await req.json();
  const pickup = await prisma.airportPickup.create({
    data: {
      tenantId: tenant.id,
      guestName: body.guestName,
      flightNumber: body.flightNumber,
      arrivalTime: body.arrivalTime ? new Date(body.arrivalTime) : null,
      driverName: body.driverName,
      status: body.status ?? "pending",
      notes: body.notes,
      guestId: body.guestId,
    },
  });

  return NextResponse.json({ pickup });
}

export async function PATCH(req: Request) {
  const session = await requirePermission("pickups:edit");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (data.arrivalTime) data.arrivalTime = new Date(data.arrivalTime);

  const pickup = await prisma.airportPickup.update({ where: { id }, data });
  return NextResponse.json({ pickup });
}
