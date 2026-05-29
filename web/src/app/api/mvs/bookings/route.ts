import { NextResponse } from "next/server";
import { requirePermission, getAdminTenant } from "@/lib/admin-api";
import { mvsGetBookings } from "@/lib/mvs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requirePermission("reservations:view");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await getAdminTenant();
  if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const mvs = await mvsGetBookings({ mvsEnabled: tenant.mvsEnabled, mvsCompanyId: tenant.mvsCompanyId });
  if (mvs.data) return NextResponse.json(mvs.data);

  const reservations = await prisma.reservation.findMany({
    where: { tenantId: tenant.id },
    include: { roomType: true },
  });
  return NextResponse.json({ bookings: reservations, source: "local" });
}
