"use client";

import { useI18n } from "@/components/language-provider";
import { LOCALE_LABELS, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <div className={`apple-segmented ${className}`}>
      {(["ko", "en"] as Locale[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={`apple-segmented-item ${
            locale === l ? "apple-segmented-item-active" : "text-muted hover:text-foreground"
          }`}
          aria-pressed={locale === l}
        >
          {LOCALE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
