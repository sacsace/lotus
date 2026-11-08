import { prisma } from "@/lib/prisma";
import { defaultDiningGallery } from "@/lib/hotel-images";

export const DINING_PHOTO_CATEGORY = "dining";
const DEFAULTS_IMPORTED_KEY = "diningGalleryDefaultsImported";

/** Keep existing uploads and import any missing default dining images once. */
export async function ensureDiningGalleryAssets(tenantId: string) {
  const existing = await prisma.mediaAsset.findMany({
    where: { tenantId, category: DINING_PHOTO_CATEGORY },
    orderBy: { sortOrder: "asc" },
  });

  const flag = await prisma.siteContent.findUnique({
    where: { tenantId_key: { tenantId, key: DEFAULTS_IMPORTED_KEY } },
  });

  // After the first import, admin deletions stay deleted.
  if (flag?.value === "1") {
    return existing;
  }

  const existingUrls = new Set(existing.map((asset) => asset.url));
  const missing = defaultDiningGallery().filter((url) => !existingUrls.has(url));
  const nextOrder = existing.reduce((max, asset) => Math.max(max, asset.sortOrder), -1) + 1;

  if (missing.length > 0) {
    await prisma.mediaAsset.createMany({
      data: missing.map((url, index) => ({
        tenantId,
        category: DINING_PHOTO_CATEGORY,
        url,
        alt: "한식",
        sortOrder: nextOrder + index,
      })),
    });
  }

  await prisma.siteContent.upsert({
    where: { tenantId_key: { tenantId, key: DEFAULTS_IMPORTED_KEY } },
    update: { value: "1" },
    create: { tenantId, key: DEFAULTS_IMPORTED_KEY, value: "1" },
  });

  return prisma.mediaAsset.findMany({
    where: { tenantId, category: DINING_PHOTO_CATEGORY },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getDiningGalleryUrls(tenantId: string) {
  const assets = await ensureDiningGalleryAssets(tenantId);
  if (assets.length === 0) return defaultDiningGallery();
  return assets.map((asset) => asset.url);
}
