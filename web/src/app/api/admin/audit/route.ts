import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/admin-api";

export async function GET(req: Request) {
  const session = await requirePermission("audit:view");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50", 10));

  const jar = await (await import("next/headers")).cookies();
  const tenantSlug = jar.get("lotus_admin_tenant")?.value;
  const tenant = tenantSlug ? await prisma.tenant.findUnique({ where: { slug: tenantSlug } }) : null;

  const logs = await prisma.auditLog.findMany({
    where: tenant ? { tenantId: tenant.id } : {},
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { adminUser: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ logs });
}
