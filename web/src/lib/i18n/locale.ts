export type Locale = "ko" | "en" | "zh" | "ja";

export const LOCALES: Locale[] = ["ko", "en", "zh", "ja"];

export const LOCALE_LABELS: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  zh: "中文",
  ja: "日本語",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "ko" || value === "en" || value === "zh" || value === "ja";
}

/** Map browser / Accept-Language tags (ko-KR, ja, zh-CN, en-IN, …) to a supported locale. */
export function detectBrowserLocale(candidates?: readonly string[] | string | null): Locale {
  const list = Array.isArray(candidates)
    ? candidates
    : typeof candidates === "string" && candidates.trim()
      ? candidates.split(",").map((part) => part.split(";")[0]?.trim() ?? "")
      : [];

  for (const raw of list) {
    const tag = raw.trim().toLowerCase();
    if (!tag) continue;
    if (tag === "ko" || tag.startsWith("ko-")) return "ko";
    if (tag === "ja" || tag.startsWith("ja-")) return "ja";
    if (tag === "zh" || tag.startsWith("zh-")) return "zh";
    if (tag === "en" || tag.startsWith("en-")) return "en";
  }
  return "ko";
}
