import { en } from "./en";
import { ja } from "./ja";
import { ko } from "./ko";
import { zh } from "./zh";
import type { Dictionary } from "./dictionary-type";
import type { Locale } from "./locale";

export type { Dictionary } from "./dictionary-type";
export type { Locale } from "./locale";
export { LOCALES, LOCALE_LABELS, detectBrowserLocale, isLocale } from "./locale";

export function getDictionary(locale: Locale): Dictionary {
  switch (locale) {
    case "en":
      return en;
    case "zh":
      return zh;
    case "ja":
      return ja;
    default:
      return ko;
  }
}

export const FEATURE_LABELS: Record<string, Record<Locale, string>> = {
  "Smart TV": { ko: "스마트 TV", en: "Smart TV", zh: "智能电视", ja: "スマートTV" },
  "High-speed WiFi": { ko: "고속 WiFi", en: "High-speed WiFi", zh: "高速 WiFi", ja: "高速WiFi" },
  "Laundry support": { ko: "세탁 지원", en: "Laundry support", zh: "洗衣支持", ja: "洗濯サポート" },
  "Work desk": { ko: "업무용 책상", en: "Work desk", zh: "办公桌", ja: "ワークデスク" },
  "Air conditioning": { ko: "에어컨", en: "Air conditioning", zh: "空调", ja: "エアコン" },
  "Long-stay support": { ko: "장기 숙박 지원", en: "Long-stay support", zh: "长期住宿支持", ja: "長期滞在サポート" },
  "Mini bar": { ko: "미니바", en: "Mini bar", zh: "迷你吧", ja: "ミニバー" },
  Kitchenette: { ko: "간이 주방", en: "Kitchenette", zh: "简易厨房", ja: "簡易キッチン" },
  Housekeeping: { ko: "하우스키핑", en: "Housekeeping", zh: "客房清洁", ja: "ハウスキーピング" },
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
