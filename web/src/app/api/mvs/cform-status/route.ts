import { NextResponse } from "next/server";
import { requirePermission, getAdminTenant } from "@/lib/admin-api";
import { mvsPostCformStatus } from "@/lib/mvs";

export async function POST(req: Request) {
  const session = await requirePermission("guests:edit");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await getAdminTenant();
  if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const body = await req.json();
  const result = await mvsPostCformStatus(body, { mvsEnabled: tenant.mvsEnabled, mvsCompanyId: tenant.mvsCompanyId });
  return NextResponse.json(result);
}
