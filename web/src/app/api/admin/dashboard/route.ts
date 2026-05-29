import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-api";
import { getDashboardStats, getAdminTenantOrThrow } from "@/lib/mvs-sync";

export async function GET() {
  const session = await requirePermission("dashboard:view");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tenant = await getAdminTenantOrThrow();
    const stats = await getDashboardStats(tenant.id);
    return NextResponse.json({ stats, tenant: { slug: tenant.slug, nameKo: tenant.nameKo, lastMvsSyncAt: tenant.lastMvsSyncAt } });
  } catch {
    return NextResponse.json({ error: "Select a hotel first" }, { status: 400 });
  }
}
