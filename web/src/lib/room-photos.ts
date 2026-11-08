import { prisma } from "@/lib/prisma";
import { HOTEL_IMAGES, roomGalleryForCode, roomImageForCode } from "@/lib/hotel-images";

export function roomPhotoCategory(code: string) {
  return `room-${code.toUpperCase()}`;
}

export function parseRoomPhotoCode(category: string) {
  const match = /^room-([A-Za-z0-9]+)$/.exec(category);
  return match?.[1]?.toUpperCase() ?? null;
}

function defaultsImportedKey(code: string) {
  return `roomGalleryDefaultsImported-${code.toUpperCase()}`;
}

/** Keep existing uploads and import any missing default room images once per type. */
export async function ensureRoomGalleryAssets(tenantId: string, code: string, fallbackImageUrl?: string | null) {
  const category = roomPhotoCategory(code);
  const existing = await prisma.mediaAsset.findMany({
    where: { tenantId, category },
    orderBy: { sortOrder: "asc" },
  });

  const flag = await prisma.siteContent.findUnique({
    where: { tenantId_key: { tenantId, key: defaultsImportedKey(code) } },
  });
  if (flag?.value === "1") {
    return existing;
  }

  const defaults = [...roomGalleryForCode(code, fallbackImageUrl)];
  const existingUrls = new Set(existing.map((asset) => asset.url));
  const missing = defaults.filter((url) => !existingUrls.has(url));
  const nextOrder = existing.reduce((max, asset) => Math.max(max, asset.sortOrder), -1) + 1;

  if (missing.length > 0) {
    await prisma.mediaAsset.createMany({
      data: missing.map((url, index) => ({
        tenantId,
        category,
        url,
        alt: `${code} Room`,
        sortOrder: nextOrder + index,
      })),
    });
  }

  await prisma.siteContent.upsert({
    where: { tenantId_key: { tenantId, key: defaultsImportedKey(code) } },
    update: { value: "1" },
    create: { tenantId, key: defaultsImportedKey(code), value: "1" },
  });

  return prisma.mediaAsset.findMany({
    where: { tenantId, category },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getRoomGalleryUrls(tenantId: string, code: string, fallbackImageUrl?: string | null) {
  const assets = await ensureRoomGalleryAssets(tenantId, code, fallbackImageUrl);
  if (assets.length > 0) {
    return assets.map((asset) => asset.url);
  }
  return [...roomGalleryForCode(code, fallbackImageUrl)];
}

export async function getRoomGalleriesByCode(tenantId: string, codes: string[]) {
  const map = new Map<string, string[]>();
  for (const code of codes) {
    map.set(code, await getRoomGalleryUrls(tenantId, code, HOTEL_IMAGES.rooms[code as keyof typeof HOTEL_IMAGES.rooms]));
  }
  return map;
}

export async function syncRoomTypeCover(tenantId: string, code: string) {
  const assets = await prisma.mediaAsset.findMany({
    where: { tenantId, category: roomPhotoCategory(code) },
    orderBy: { sortOrder: "asc" },
  });
  const cover = assets[0]?.url ?? roomImageForCode(code);
  await prisma.roomType.updateMany({
    where: { tenantId, code },
    data: { imageUrl: cover },
  });
  return cover;
}
