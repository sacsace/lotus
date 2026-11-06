import type { MetadataRoute } from "next";
import { listTenantsPublic } from "@/lib/tenant";
import { absoluteUrl } from "@/lib/seo";

const PUBLIC_PATHS = ["", "/rooms", "/dining", "/services", "/contact"] as const;

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tenants = await listTenantsPublic();
  const lastModified = new Date();

  return tenants.flatMap((tenant) =>
    PUBLIC_PATHS.map((suffix) => ({
      url: absoluteUrl(`/${tenant.slug}${suffix}`),
      lastModified,
      changeFrequency: suffix === "" ? "weekly" : "monthly",
      priority: suffix === "" ? 1 : 0.7,
    })),
  );
}
