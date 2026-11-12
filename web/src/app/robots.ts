import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  const host = new URL(base).host;
  const disallow = ["/admin", "/admin/", "/api/", "/api"];

  return {
    rules: [
      // Naver crawler (Yeti) — explicit allow helps Search Advisor validation.
      {
        userAgent: "Yeti",
        allow: "/",
        disallow,
      },
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
    ],
    host,
    sitemap: `${base}/sitemap.xml`,
  };
}
