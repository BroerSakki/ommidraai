"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { NextIntlClientProvider } from "next-intl";
import afMessages from "@/messages/af.json";
import enMessages from "@/messages/en.json";

export type Locale = "af" | "en";

const STORAGE_KEY = "ommidraai-language";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

interface LanguageContextValue {
  locale: Locale;
  changeLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Reads a previously saved language preference from browser storage.
 * Checks localStorage first, then falls back to a document cookie.
 */
function readSavedLocale(): Locale | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "af" || stored === "en") {
      return stored;
    }
  } catch {
    // localStorage unavailable (blocked / private mode) -> keep going
  }

  try {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${STORAGE_KEY}=`));
    const value = cookie?.split("=")[1];
    if (value === "af" || value === "en") {
      return value;
    }
  } catch {
    // cookies unavailable -> ignore
  }

  return null;
}

/** Persists the active locale to both localStorage and a cookie. */
function persistLocale(locale: Locale) {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // ignore storage errors
  }

  try {
    document.cookie = `${STORAGE_KEY}=${locale};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
  } catch {
    // ignore cookie errors
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // The default language is Afrikaans ("af"). The real saved preference is
  // loaded on the client during mount so that server rendering stays
  // deterministic (no hydration mismatches).
  const [locale, setLocale] = useState<Locale>("af");

  useEffect(() => {
    const saved = readSavedLocale();
    if (saved) {
      setLocale(saved);
    }
  }, []);

  // Keep the <html lang="..."> attribute in sync with the active locale.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const changeLocale = useCallback((next: Locale) => {
    setLocale(next);
    persistLocale(next);
  }, []);

  const messages = locale === "af" ? afMessages : enMessages;

  return (
    <LanguageContext.Provider value={{ locale, changeLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error(
      "useLanguage must be used within a <LanguageProvider>."
    );
  }
  return context;
}