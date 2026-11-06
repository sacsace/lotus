import { prisma } from "@/lib/prisma";
import { HOTEL_IMAGES } from "@/lib/hotel-images";

export async function getSiteContent(tenantId: string, key: string, fallback: string) {
  const row = await prisma.siteContent.findUnique({
    where: { tenantId_key: { tenantId, key } },
  });
  return row?.value ?? fallback;
}

export async function getSiteContentJson<T>(tenantId: string, key: string, fallback: T): Promise<T> {
  const raw = await getSiteContent(tenantId, key, JSON.stringify(fallback));
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function getHeroImages(tenantId: string): Promise<{ url: string; alt: string }[]> {
  const assets = await prisma.mediaAsset.findMany({
    where: { tenantId, category: "hero" },
    orderBy: { sortOrder: "asc" },
  });
  const fromDb = assets.map((a) => ({ url: a.url, alt: a.alt ?? "Lotus Korean Hotel" }));
  const defaults = DEFAULT_HERO_IMAGES.map((h) => ({ url: h.url, alt: h.alt }));
  if (fromDb.length === 0) return defaults;
  const seen = new Set(fromDb.map((h) => h.url));
  return [...fromDb, ...defaults.filter((h) => !seen.has(h.url))];
}

export const DEFAULT_HERO_IMAGES = HOTEL_IMAGES.hero;

export const DEFAULT_TESTIMONIALS = [
  {
    name: "Kim J.H.",
    company: "Samsung India",
    quote: "Lotus feels like home in Bengaluru. Korean breakfast and airport pickup made my long stay effortless.",
  },
  {
    name: "Park S.M.",
    company: "LG Electronics",
    quote: "Professional service, clean rooms, and excellent support for FRRO documentation.",
  },
  {
    name: "Lee H.Y.",
    company: "Hyundai Motor India",
    quote: "The best Korean business hotel experience in India. Highly recommended for corporate travelers.",
  },
];

export const ROOM_FEATURES = ["Smart TV", "High-speed WiFi", "Laundry support", "Work desk", "Air conditioning", "Long-stay support"];
