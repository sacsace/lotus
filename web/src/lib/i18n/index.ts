import { en } from "./en";
import { ko } from "./ko";
import type { Dictionary } from "./dictionary-type";

export type { Dictionary } from "./dictionary-type";
export type Locale = "ko" | "en";

export const LOCALES: Locale[] = ["ko", "en"];

export const LOCALE_LABELS: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
};

export function getDictionary(locale: Locale): Dictionary {
  return locale === "en" ? en : ko;
}

export const FEATURE_LABELS: Record<string, { ko: string; en: string }> = {
  "Smart TV": { ko: "스마트 TV", en: "Smart TV" },
  "High-speed WiFi": { ko: "고속 WiFi", en: "High-speed WiFi" },
  "Laundry support": { ko: "세탁 지원", en: "Laundry support" },
  "Work desk": { ko: "업무용 책상", en: "Work desk" },
  "Air conditioning": { ko: "에어컨", en: "Air conditioning" },
  "Long-stay support": { ko: "장기 숙박 지원", en: "Long-stay support" },
  "Mini bar": { ko: "미니바", en: "Mini bar" },
  Kitchenette: { ko: "간이 주방", en: "Kitchenette" },
  Housekeeping: { ko: "하우스키핑", en: "Housekeeping" },
};

export function translateFeature(label: string, locale: Locale): string {
  return FEATURE_LABELS[label]?.[locale] ?? label;
}

export const SERVICE_IDS = [
  "airport",
  "laundry",
  "netflix",
  "frro",
  "cform",
  "longstay",
  "homestay",
  "corporate",
  "housekeeping",
  "transport",
] as const;

export type ServiceId = (typeof SERVICE_IDS)[number];

export const SERVICE_ICONS: Record<ServiceId, string> = {
  airport: "✈",
  laundry: "◈",
  netflix: "▷",
  frro: "▣",
  cform: "▤",
  longstay: "⌂",
  homestay: "⌂",
  corporate: "◆",
  housekeeping: "✦",
  transport: "→",
};
