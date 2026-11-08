import { prisma } from "@/lib/prisma";
import { HOTEL_IMAGES, roomGalleryForCode, roomImageForCode } from "@/lib/hotel-images";

export function roomPhotoCategory(code: string) {
  return `room-${code.toUpperCase()}`;
}

export function parseRoomPhotoCode(category: string) {
  const match = /^room-([A-Za-z0-9]+)$/.exec(category);
  return match?.[1]?.toUpperCase() ?? null;
}

export async function getRoomGalleryUrls(tenantId: string, code: string, fallbackImageUrl?: string | null) {
  const assets = await prisma.mediaAsset.findMany({
    where: { tenantId, category: roomPhotoCategory(code) },
    orderBy: { sortOrder: "asc" },
  });
  if (assets.length > 0) {
    return assets.map((a) => a.url);
  }
  return [...roomGalleryForCode(code, fallbackImageUrl)];
}

export async function getRoomGalleriesByCode(tenantId: string, codes: string[]) {
  const assets = await prisma.mediaAsset.findMany({
    where: {
      tenantId,
      category: { in: codes.map(roomPhotoCategory) },
    },
    orderBy: { sortOrder: "asc" },
  });

  const map = new Map<string, string[]>();
  for (const code of codes) map.set(code, []);
  for (const asset of assets) {
    const code = parseRoomPhotoCode(asset.category);
    if (!code || !map.has(code)) continue;
    map.get(code)!.push(asset.url);
  }

  for (const code of codes) {
    if ((map.get(code) ?? []).length === 0) {
      map.set(code, [...roomGalleryForCode(code, HOTEL_IMAGES.rooms[code as keyof typeof HOTEL_IMAGES.rooms])]);
    }
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
