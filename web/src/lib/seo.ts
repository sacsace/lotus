import type { Metadata } from "next";
import { LOCALES } from "@/lib/i18n/locale";

export const SITE_NAME = "Lotus Korean Hotel";
export const SITE_NAME_KO = "로터스 코리안 호텔";
export const SITE_TAGLINE = "인도에서 만나는 한국식 비즈니스 호텔";
export const SITE_DESCRIPTION =
  "벵갈루루 한국식 비즈니스 호텔. 편안한 객실, 한식 조식과 석식, 공항 픽업, 장기 체류 지원을 한곳에서. Doddanekkundi · Whitefield 인근.";
export const SITE_KEYWORDS = [
  "Lotus Korean Hotel",
  "로터스 코리안 호텔",
  "벵갈루루 한국 호텔",
  "Bangalore Korean hotel",
  "Korean business hotel India",
  "Bengaluru Korean stay",
  "한식 호텔 인도",
  "공항 픽업 호텔 벵갈루루",
  "Doddanekkundi hotel",
  "Whitefield Korean hotel",
  "장기 숙박 인도",
  "班加罗尔韩国酒店",
  "ベンガルール韓国ホテル",
];

export const OG_LOCALES = {
  primary: "ko_KR",
  alternates: ["en_IN", "zh_CN", "ja_JP"] as const,
} as const;

export function getSiteUrl() {
  // Production serves on www; apex (hotellotus.in) is not on Railway and returns 404 for many paths.
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.hotellotus.in").replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized === "/" ? "" : normalized}`;
}

export function languageAlternates(path: string): Record<string, string> {
  const url = absoluteUrl(path);
  const languages: Record<string, string> = { "x-default": url };
  for (const locale of LOCALES) languages[locale] = url;
  return languages;
}

type BuildMetaInput = {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  noIndex?: boolean;
};

export function buildMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  noIndex = false,
}: BuildMetaInput): Metadata {
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl("/opengraph-image");
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: SITE_KEYWORDS,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALES.primary,
      alternateLocale: [...OG_LOCALES.alternates],
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
  };
}

export const PAGE_SEO = {
  home: {
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  rooms: {
    title: "객실",
    description:
      "출장과 장기 체류를 위한 S·M·B 객실. 업무용 책상, 고속 Wi-Fi, 조용한 휴식 공간을 갖춘 벵갈루루 한국식 호텔.",
  },
  dining: {
    title: "한식 다이닝",
    description:
      "매일 준비되는 한국식 조식과 석식. 밥, 국, 메인, 반찬이 차려진 한상으로 벵갈루루에서도 익숙한 식사를.",
  },
  services: {
    title: "서비스",
    description:
      "공항 픽업, 세탁, 하우스키핑, 장기 체류 지원 등 한국 기업 출장객을 위한 실무 서비스를 제공합니다.",
  },
  contact: {
    title: "문의",
    description:
      "객실 문의, 장기 숙박, 공항 픽업, 기업 예약. 벵갈루루 Lotus Korean Hotel에 연락하세요.",
  },
  book: {
    title: "예약",
    description: "Lotus Korean Hotel 객실 예약 문의. 출장과 장기 체류 일정을 알려 주시면 안내해 드립니다.",
  },
  myReservation: {
    title: "내 예약",
    description: "예약 코드와 이메일로 Lotus Korean Hotel 예약을 조회합니다.",
  },
} as const;
