import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission, getAdminTenant } from "@/lib/admin-api";
import { logAdminAction } from "@/lib/audit";
import { ensureRoomGalleryAssets, parseRoomPhotoCode, roomPhotoCategory, syncRoomTypeCover } from "@/lib/room-photos";
import { tryDeleteUpload } from "@/lib/uploads";

async function revalidateRooms(slug: string) {
  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/rooms`);
}

export async function GET() {
  const session = await requirePermission("content:view");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await getAdminTenant();
  if (!tenant) return NextResponse.json({ error: "NO_TENANT" }, { status: 400 });

  const roomTypes = await prisma.roomType.findMany({
    where: { tenantId: tenant.id },
    orderBy: { code: "asc" },
    select: { id: true, code: true, nameKo: true, imageUrl: true },
  });

  const byCode: Record<string, Awaited<ReturnType<typeof ensureRoomGalleryAssets>>> = {};
  for (const type of roomTypes) {
    byCode[type.code] = await ensureRoomGalleryAssets(tenant.id, type.code, type.imageUrl);
  }

  return NextResponse.json({ tenant: { slug: tenant.slug, nameKo: tenant.nameKo }, roomTypes, photos: byCode });
}

export async function POST(req: Request) {
  const session = await requirePermission("content:edit");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await getAdminTenant();
  if (!tenant) return NextResponse.json({ error: "NO_TENANT" }, { status: 400 });

  const body = await req.json();
  const code = String(body.code ?? "").toUpperCase();
  const url = String(body.url ?? "").trim();
  const alt = String(body.alt ?? `${code} Room`).trim() || `${code} Room`;

  if (!code || !url) {
    return NextResponse.json({ error: "객실 코드와 이미지 주소가 필요합니다." }, { status: 400 });
  }

  const roomType = await prisma.roomType.findUnique({
    where: { tenantId_code: { tenantId: tenant.id, code } },
  });
  if (!roomType) {
    return NextResponse.json({ error: "객실 유형을 찾을 수 없습니다." }, { status: 404 });
  }

  const category = roomPhotoCategory(code);
  const max = await prisma.mediaAsset.findFirst({
    where: { tenantId: tenant.id, category },
    orderBy: { sortOrder: "desc" },
  });
  const nextOrder = typeof body.sortOrder === "number" ? body.sortOrder : (max?.sortOrder ?? -1) + 1;

  const created = await prisma.mediaAsset.create({
    data: {
      tenantId: tenant.id,
      category,
      url,
      alt,
      sortOrder: nextOrder,
    },
  });

  await syncRoomTypeCover(tenant.id, code);
  await logAdminAction({
    adminUserId: session.sub,
    tenantId: tenant.id,
    action: "ROOM_PHOTO_ADD",
    resource: created.id,
    details: JSON.stringify({ code, url }),
  });
  await revalidateRooms(tenant.slug);

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
    where: { id: body.id, tenantId: tenant.id, category: { startsWith: "room-" } },
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

  const code = parseRoomPhotoCode(updated.category);
  if (code) await syncRoomTypeCover(tenant.id, code);

  await logAdminAction({
    adminUserId: session.sub,
    tenantId: tenant.id,
    action: "ROOM_PHOTO_UPDATE",
    resource: updated.id,
    details: JSON.stringify(body),
  });
  await revalidateRooms(tenant.slug);

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
    where: { id: body.id, tenantId: tenant.id, category: { startsWith: "room-" } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.mediaAsset.delete({ where: { id: existing.id } });
  await tryDeleteUpload(existing.url);

  const code = parseRoomPhotoCode(existing.category);
  if (code) await syncRoomTypeCover(tenant.id, code);

  await logAdminAction({
    adminUserId: session.sub,
    tenantId: tenant.id,
    action: "ROOM_PHOTO_DELETE",
    resource: existing.id,
    details: JSON.stringify({ url: existing.url, code }),
  });
  await revalidateRooms(tenant.slug);

  return NextResponse.json({ ok: true });
}
