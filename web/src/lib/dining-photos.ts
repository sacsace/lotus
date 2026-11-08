import { prisma } from "@/lib/prisma";
import { defaultDiningGallery } from "@/lib/hotel-images";

export const DINING_PHOTO_CATEGORY = "dining";

export async function getDiningGalleryUrls(tenantId: string) {
  const assets = await prisma.mediaAsset.findMany({
    where: { tenantId, category: DINING_PHOTO_CATEGORY },
    orderBy: { sortOrder: "asc" },
  });
  if (assets.length > 0) {
    return assets.map((a) => a.url);
  }
  return defaultDiningGallery();
}
