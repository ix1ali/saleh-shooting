"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { I18n, Locale } from "@/data/site";
import { ScrollTrigger } from "./gsap";
import LanguageCurtain from "@/components/ui/LanguageCurtain";

type Ctx = {
  locale: Locale;
  dir: "ltr" | "rtl";
  /** Resolve a bilingual string for the active locale. */
  T: (v: I18n) => string;
  toggle: () => void;
  /** Increments on every language change so animations can re-run. */
  version: number;
  /** True while the language curtain is covering the page. */
  switching: boolean;
};

const LocaleCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "sq8:locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [version, setVersion] = useState(0);
  const [switching, setSwitching] = useState(false);

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

  /**
   * Switching language is a staged transition, not a swap.
   *
   * The two scripts have completely different metrics, so replacing the text
   * in place makes the whole page jump. Instead a curtain closes over the
   * page, the locale changes behind it, ScrollTrigger remeasures, and the
   * curtain lifts — the visitor sees one deliberate move rather than a
   * flash of reflowing text.
   */
  const toggle = useCallback(() => {
    if (switching) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setLocale((l) => (l === "en" ? "ar" : "en"));
      setVersion((v) => v + 1);
      return;
    }

    setSwitching(true);
    window.setTimeout(() => {
      setLocale((l) => (l === "en" ? "ar" : "en"));
      setVersion((v) => v + 1);
    }, 420);
    window.setTimeout(() => setSwitching(false), 780);
  }, [switching]);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      dir: locale === "ar" ? "rtl" : "ltr",
      T: (v: I18n) => v[locale],
      toggle,
      version,
      switching,
    }),
    [locale, toggle, version, switching]
  );

  return (
    <LocaleCtx.Provider value={value}>
      {children}
      <LanguageCurtain active={switching} locale={locale} />
    </LocaleCtx.Provider>
  );
}

export function useLocale(): Ctx {
  const ctx = useContext(LocaleCtx);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}
