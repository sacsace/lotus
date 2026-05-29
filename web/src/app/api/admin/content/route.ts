import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/admin-api";
import { logAdminAction } from "@/lib/audit";

export async function GET() {
  const session = await requirePermission("content:view");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jar = await (await import("next/headers")).cookies();
  const tenantSlug = jar.get("lotus_admin_tenant")?.value;
  if (!tenantSlug) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [contents, menus, announcements, media] = await Promise.all([
    prisma.siteContent.findMany({ where: { tenantId: tenant.id } }),
    prisma.diningMenu.findMany({ where: { tenantId: tenant.id }, orderBy: { menuDate: "desc" }, take: 10 }),
    prisma.announcement.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: "desc" } }),
    prisma.mediaAsset.findMany({ where: { tenantId: tenant.id }, orderBy: { sortOrder: "asc" } }),
  ]);

  return NextResponse.json({ contents, menus, announcements, media, tenant });
}

export async function PATCH(req: Request) {
  const session = await requirePermission("content:edit");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jar = await (await import("next/headers")).cookies();
  const tenantSlug = jar.get("lotus_admin_tenant")?.value;
  const tenant = tenantSlug ? await prisma.tenant.findUnique({ where: { slug: tenantSlug } }) : null;
  if (!tenant) return NextResponse.json({ error: "No tenant" }, { status: 400 });

  const body = await req.json();

  if (body.type === "tenant") {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        phone: body.phone,
        email: body.email,
        address: body.address,
        whatsapp: body.whatsapp,
      },
    });
  }

  if (body.type === "menu") {
    const menuDate = new Date(body.menuDate);
    menuDate.setHours(0, 0, 0, 0);
    await prisma.diningMenu.upsert({
      where: { tenantId_mealType_menuDate: { tenantId: tenant.id, mealType: body.mealType, menuDate } },
      update: { items: JSON.stringify(body.items) },
      create: { tenantId: tenant.id, mealType: body.mealType, menuDate, items: JSON.stringify(body.items) },
    });
  }

  if (body.type === "announcement") {
    if (body.id) {
      await prisma.announcement.update({
        where: { id: body.id },
        data: { title: body.title, body: body.body, active: body.active },
      });
    } else {
      await prisma.announcement.create({
        data: { tenantId: tenant.id, title: body.title, body: body.body, active: body.active ?? true },
      });
    }
  }

  if (body.type === "content") {
    await prisma.siteContent.upsert({
      where: { tenantId_key: { tenantId: tenant.id, key: body.key } },
      update: { value: body.value },
      create: { tenantId: tenant.id, key: body.key, value: body.value },
    });
  }

  if (body.type === "hero-add") {
    if (!body.url) return NextResponse.json({ error: "Missing url" }, { status: 400 });
    const max = await prisma.mediaAsset.findFirst({
      where: { tenantId: tenant.id, category: "hero" },
      orderBy: { sortOrder: "desc" },
    });
    const nextOrder = (max?.sortOrder ?? -1) + 1;
    const created = await prisma.mediaAsset.create({
      data: {
        tenantId: tenant.id,
        category: "hero",
        url: body.url,
        alt: body.alt ?? "Lotus Korean Hotel",
        sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : nextOrder,
      },
    });
    await logAdminAction({ adminUserId: session.sub, tenantId: tenant.id, action: "HERO_ADD", resource: created.id, details: JSON.stringify(body) });
    return NextResponse.json({ ok: true, asset: created });
  }

  if (body.type === "hero-update") {
    if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const updated = await prisma.mediaAsset.update({
      where: { id: body.id },
      data: {
        alt: body.alt ?? undefined,
        sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : undefined,
        url: body.url ?? undefined,
      },
    });
    await logAdminAction({ adminUserId: session.sub, tenantId: tenant.id, action: "HERO_UPDATE", resource: updated.id, details: JSON.stringify(body) });
    return NextResponse.json({ ok: true, asset: updated });
  }

  if (body.type === "hero-delete") {
    if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await prisma.mediaAsset.delete({ where: { id: body.id } });
    await logAdminAction({ adminUserId: session.sub, tenantId: tenant.id, action: "HERO_DELETE", resource: body.id, details: JSON.stringify(body) });
    return NextResponse.json({ ok: true });
  }

  await logAdminAction({
    adminUserId: session.sub,
    tenantId: tenant.id,
    action: "CONTENT_UPDATE",
    resource: body.type,
    details: JSON.stringify(body),
  });

  return NextResponse.json({ ok: true });
}
