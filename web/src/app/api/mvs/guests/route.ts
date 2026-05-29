import { NextResponse } from "next/server";
import { requirePermission, getAdminTenant } from "@/lib/admin-api";
import { mvsGetGuests } from "@/lib/mvs";
import { prisma } from "@/lib/prisma";

async function tenantContext() {
  const tenant = await getAdminTenant();
  if (!tenant) return null;
  return tenant;
}

export async function GET() {
  const session = await requirePermission("guests:view");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await tenantContext();
  if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const mvs = await mvsGetGuests({ mvsEnabled: tenant.mvsEnabled, mvsCompanyId: tenant.mvsCompanyId });
  if (mvs.data) return NextResponse.json(mvs.data);

  const guests = await prisma.guest.findMany({ where: { tenantId: tenant.id } });
  return NextResponse.json({ guests, source: "local", note: mvs.error ?? mvs.localOnly });
}
