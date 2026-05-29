import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdminCookie } from "@/lib/admin-api";

export async function GET() {
  if (!(await assertAdminCookie())) {
    return NextResponse.json({ error: "권한 없음" }, { status: 401 });
  }
  const tenants = await prisma.tenant.findMany({
    orderBy: { nameKo: "asc" },
    select: { slug: true, nameKo: true, mvsEnabled: true, mvsCompanyId: true },
  });
  return NextResponse.json({ tenants });
}
