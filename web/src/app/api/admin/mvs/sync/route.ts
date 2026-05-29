import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-api";
import { syncTenantFromMvs, getAdminTenantOrThrow } from "@/lib/mvs-sync";

export async function POST() {
  const session = await requirePermission("mvs:sync");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tenant = await getAdminTenantOrThrow();
    const result = await syncTenantFromMvs(tenant.id, tenant.mvsEnabled, tenant.mvsCompanyId, session.sub);
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ error: "Select a hotel first" }, { status: 400 });
  }
}
