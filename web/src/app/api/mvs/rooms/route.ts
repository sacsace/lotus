import { NextResponse } from "next/server";
import { requirePermission, getAdminTenant } from "@/lib/admin-api";
import { mvsGetRooms } from "@/lib/mvs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requirePermission("rooms:view");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await getAdminTenant();
  if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const mvs = await mvsGetRooms({ mvsEnabled: tenant.mvsEnabled, mvsCompanyId: tenant.mvsCompanyId });
  if (mvs.data) return NextResponse.json(mvs.data);

  const rooms = await prisma.room.findMany({ where: { tenantId: tenant.id }, include: { guest: true, roomType: true } });
  return NextResponse.json({ rooms, source: "local" });
}
