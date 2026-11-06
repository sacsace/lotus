import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
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
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TAGLINE, getSiteUrl } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: getSiteUrl() }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "travel",
  formatDetection: { telephone: true, email: true, address: true },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    alternateLocale: ["en_IN"],
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans antialiased text-foreground bg-background">
        <LanguageProvider>
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
