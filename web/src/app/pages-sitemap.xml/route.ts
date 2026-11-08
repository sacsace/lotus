import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/seo";

/** Legacy WordPress/old-site sitemap URL still submitted in Google Search Console. */
export function GET() {
  return NextResponse.redirect(absoluteUrl("/sitemap.xml"), 301);
}
