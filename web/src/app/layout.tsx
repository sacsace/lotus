import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lotus Korean Hotel | 인도에서 만나는 한국식 비즈니스 호텔",
  description: "한국 기업 출장객을 위한 비즈니스 호텔. 객실, 한식 다이닝, 공항 픽업, 장기 숙박 지원.",
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
      <body className={`${inter.variable} min-h-screen flex flex-col font-sans antialiased text-foreground bg-background`}>
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
