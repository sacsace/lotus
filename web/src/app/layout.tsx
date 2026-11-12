import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { isLocale, type Locale } from "@/lib/i18n";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/ibm-plex-sans-kr/latin-300.css";
import "@fontsource/ibm-plex-sans-kr/latin-400.css";
import "@fontsource/ibm-plex-sans-kr/latin-500.css";
import "@fontsource/ibm-plex-sans-kr/latin-600.css";
import "@fontsource/ibm-plex-sans-kr/latin-700.css";
import "@fontsource/ibm-plex-sans-kr/korean-300.css";
import "@fontsource/ibm-plex-sans-kr/korean-400.css";
import "@fontsource/ibm-plex-sans-kr/korean-500.css";
import "@fontsource/ibm-plex-sans-kr/korean-600.css";
import "@fontsource/ibm-plex-sans-kr/korean-700.css";
import { GoogleTagManager, GoogleTagManagerNoscript } from "@/components/analytics/google-tag-manager";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import {
  OG_LOCALES,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
  getSiteUrl,
  languageAlternates,
} from "@/lib/seo";
import "./globals.css";

// The SQLite file is on a Railway volume, which is not mounted while the image is built.
export const dynamic = "force-dynamic";

const siteUrl = getSiteUrl();
const ogImage = absoluteUrl("/opengraph-image");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: siteUrl }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "travel",
  formatDetection: { telephone: true, email: true, address: true },
  robots: { index: true, follow: true },
  verification: {
    other: {
      "naver-site-verification":
        process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION?.trim() ||
        "b020d60eb1d7eec3d81135f3048b025994f9ad1f",
    },
  },
  alternates: {
    canonical: siteUrl,
    languages: languageAlternates("/"),
  },
  openGraph: {
    type: "website",
    locale: OG_LOCALES.primary,
    alternateLocale: [...OG_LOCALES.alternates],
    url: siteUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [ogImage],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f2ec" },
    { media: "(prefers-color-scheme: dark)", color: "#25313d" },
  ],
};

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
    </div>
  );
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jar = await cookies();
  const cookieLocale = jar.get("lotus-locale")?.value;
  const initialLocale: Locale = isLocale(cookieLocale) ? cookieLocale : "ko";

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans antialiased text-foreground bg-background">
        <GoogleTagManagerNoscript />
        <GoogleTagManager />
        <LanguageProvider initialLocale={initialLocale}>
          <ThemeProvider>
            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>{children}</Suspense>
            </main>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
