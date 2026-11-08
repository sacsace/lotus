import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { listTenantsPublic } from "@/lib/tenant";

const PUBLIC_PATHS = [
  { suffix: "", changeFrequency: "weekly" as const, priority: 1 },
  { suffix: "/rooms", changeFrequency: "weekly" as const, priority: 0.9 },
  { suffix: "/dining", changeFrequency: "weekly" as const, priority: 0.85 },
  { suffix: "/services", changeFrequency: "monthly" as const, priority: 0.8 },
  { suffix: "/contact", changeFrequency: "monthly" as const, priority: 0.8 },
  { suffix: "/book", changeFrequency: "weekly" as const, priority: 0.75 },
] as const;

export const dynamic = "force-dynamic";

function primarySlug(slugs: string[]) {
  const preferred = process.env.DEFAULT_TENANT_SLUG?.trim();
  if (preferred && slugs.includes(preferred)) return preferred;
  if (slugs.includes("lotus-india")) return "lotus-india";
  return slugs[0] ?? null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tenants = await listTenantsPublic();
  const slug = primarySlug(tenants.map((t) => t.slug));
  if (!slug) return [];

  const lastModified = new Date();
  return PUBLIC_PATHS.map(({ suffix, changeFrequency, priority }) => ({
    url: absoluteUrl(`/${slug}${suffix}`),
    lastModified,
    changeFrequency,
    priority,
  }));
}
