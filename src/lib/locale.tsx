"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { I18n, Locale } from "@/data/site";
import { ScrollTrigger } from "./gsap";

type Ctx = {
  locale: Locale;
  dir: "ltr" | "rtl";
  /** Resolve a bilingual string for the active locale. */
  T: (v: I18n) => string;
  toggle: () => void;
  /** Increments on every language change so animations can re-run. */
  version: number;
};

const LocaleCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "sq8:locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved === "ar" || saved === "en") setLocale(saved);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = locale === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem(STORAGE_KEY, locale);
    /* Metrics change completely between scripts — remeasure everything. */
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 60);
    return () => window.clearTimeout(id);
  }, [locale]);

  const toggle = useCallback(() => {
    setLocale((l) => (l === "en" ? "ar" : "en"));
    setVersion((v) => v + 1);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      dir: locale === "ar" ? "rtl" : "ltr",
      T: (v: I18n) => v[locale],
      toggle,
      version,
    }),
    [locale, toggle, version]
  );

  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}

export function useLocale(): Ctx {
  const ctx = useContext(LocaleCtx);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}
