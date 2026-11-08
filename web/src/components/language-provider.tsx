"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { detectBrowserLocale, getDictionary, isLocale, type Dictionary, type Locale } from "@/lib/i18n";

const STORAGE_KEY = "lotus-locale";
const COOKIE_KEY = "lotus-locale";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readCookieLocale(): Locale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )lotus-locale=([^;]+)/);
  const value = match?.[1] ? decodeURIComponent(match[1]) : null;
  return isLocale(value) ? value : null;
}

function writeLocaleCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(locale)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

function detectClientLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // ignore
  }
  const cookie = readCookieLocale();
  if (cookie) return cookie;
  const fromNavigator = [
    ...(Array.isArray(navigator.languages) ? navigator.languages : []),
    navigator.language,
  ].filter(Boolean);
  return detectBrowserLocale(fromNavigator);
}

export function LanguageProvider({
  children,
  initialLocale = "ko",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const next = detectClientLocale();
    setLocaleState(next);
    document.documentElement.lang = next;
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        window.localStorage.setItem(STORAGE_KEY, next);
      }
    } catch {
      // ignore
    }
    writeLocaleCookie(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    writeLocaleCookie(next);
    document.documentElement.lang = next;
  }, []);

  const t = useMemo(() => getDictionary(locale), [locale]);
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}

export function formatMsg(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}
