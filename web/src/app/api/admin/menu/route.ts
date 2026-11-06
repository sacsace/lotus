import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/admin-api";
import { logAdminAction } from "@/lib/audit";
import { HANSIK_MENU, HANSIK_MENU_KEY, normalizeHansikMenu, readHansikMenu } from "@/lib/hansik-menu";

async function currentTenant() {
  const jar = await (await import("next/headers")).cookies();
  const tenantSlug = jar.get("lotus_admin_tenant")?.value;
  if (!tenantSlug) return null;
  return prisma.tenant.findUnique({ where: { slug: tenantSlug } });
}

export async function GET() {
  const session = await requirePermission("content:view");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await currentTenant();
  if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const row = await prisma.siteContent.findUnique({
    where: { tenantId_key: { tenantId: tenant.id, key: HANSIK_MENU_KEY } },
  });

  return NextResponse.json({
    sections: row ? readHansikMenu(row.value) : HANSIK_MENU,
    saved: Boolean(row),
  });
}

export async function PUT(req: Request) {
  const session = await requirePermission("content:edit");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await currentTenant();
  if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const sections = normalizeHansikMenu(body?.sections);
  if (!sections) return NextResponse.json({ error: "메뉴 형식이 올바르지 않습니다." }, { status: 400 });

  const value = JSON.stringify(sections);
  await prisma.siteContent.upsert({
    where: { tenantId_key: { tenantId: tenant.id, key: HANSIK_MENU_KEY } },
    update: { value },
    create: { tenantId: tenant.id, key: HANSIK_MENU_KEY, value },
  });

  await logAdminAction({
    adminUserId: session.sub,
    tenantId: tenant.id,
    action: "MENU_UPDATE",
    resource: HANSIK_MENU_KEY,
    details: JSON.stringify({ sections: sections.length }),
  });

  revalidatePath(`/${tenant.slug}/dining`);
  return NextResponse.json({ ok: true, sections });
}
