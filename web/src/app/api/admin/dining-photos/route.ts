import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission, getAdminTenant } from "@/lib/admin-api";
import { logAdminAction } from "@/lib/audit";
import { DINING_PHOTO_CATEGORY } from "@/lib/dining-photos";
import { tryDeleteUpload } from "@/lib/uploads";

async function revalidateDining(slug: string) {
  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/dining`);
}

export async function GET() {
  const session = await requirePermission("content:view");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await getAdminTenant();
  if (!tenant) return NextResponse.json({ error: "NO_TENANT" }, { status: 400 });

  const photos = await prisma.mediaAsset.findMany({
    where: { tenantId: tenant.id, category: DINING_PHOTO_CATEGORY },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({
    tenant: { slug: tenant.slug, nameKo: tenant.nameKo },
    photos,
  });
}

export async function POST(req: Request) {
  const session = await requirePermission("content:edit");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await getAdminTenant();
  if (!tenant) return NextResponse.json({ error: "NO_TENANT" }, { status: 400 });

  const body = await req.json();
  const url = String(body.url ?? "").trim();
  const alt = String(body.alt ?? "한식").trim() || "한식";

  if (!url) {
    return NextResponse.json({ error: "이미지 주소가 필요합니다." }, { status: 400 });
  }

  const max = await prisma.mediaAsset.findFirst({
    where: { tenantId: tenant.id, category: DINING_PHOTO_CATEGORY },
    orderBy: { sortOrder: "desc" },
  });
  const nextOrder = typeof body.sortOrder === "number" ? body.sortOrder : (max?.sortOrder ?? -1) + 1;

  const created = await prisma.mediaAsset.create({
    data: {
      tenantId: tenant.id,
      category: DINING_PHOTO_CATEGORY,
      url,
      alt,
      sortOrder: nextOrder,
    },
  });

  await logAdminAction({
    adminUserId: session.sub,
    tenantId: tenant.id,
    action: "DINING_PHOTO_ADD",
    resource: created.id,
    details: JSON.stringify({ url }),
  });
  await revalidateDining(tenant.slug);

  return NextResponse.json({ ok: true, asset: created });
}

export async function PATCH(req: Request) {
  const session = await requirePermission("content:edit");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await getAdminTenant();
  if (!tenant) return NextResponse.json({ error: "NO_TENANT" }, { status: 400 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await prisma.mediaAsset.findFirst({
    where: { id: body.id, tenantId: tenant.id, category: DINING_PHOTO_CATEGORY },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const nextUrl = typeof body.url === "string" && body.url.trim() ? body.url.trim() : undefined;
  if (nextUrl && nextUrl !== existing.url) {
    await tryDeleteUpload(existing.url);
  }

  const updated = await prisma.mediaAsset.update({
    where: { id: existing.id },
    data: {
      alt: typeof body.alt === "string" ? body.alt : undefined,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : undefined,
      url: nextUrl,
    },
  });

  await logAdminAction({
    adminUserId: session.sub,
    tenantId: tenant.id,
    action: "DINING_PHOTO_UPDATE",
    resource: updated.id,
    details: JSON.stringify(body),
  });
  await revalidateDining(tenant.slug);

  return NextResponse.json({ ok: true, asset: updated });
}

export async function DELETE(req: Request) {
  const session = await requirePermission("content:edit");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await getAdminTenant();
  if (!tenant) return NextResponse.json({ error: "NO_TENANT" }, { status: 400 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await prisma.mediaAsset.findFirst({
    where: { id: body.id, tenantId: tenant.id, category: DINING_PHOTO_CATEGORY },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.mediaAsset.delete({ where: { id: existing.id } });
  await tryDeleteUpload(existing.url);

  await logAdminAction({
    adminUserId: session.sub,
    tenantId: tenant.id,
    action: "DINING_PHOTO_DELETE",
    resource: existing.id,
    details: JSON.stringify({ url: existing.url }),
  });
  await revalidateDining(tenant.slug);

  return NextResponse.json({ ok: true });
}
