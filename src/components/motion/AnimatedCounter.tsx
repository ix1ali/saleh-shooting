"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { START, prefersReducedMotion, useGsap } from "@/lib/motion";
import { useLocale } from "@/lib/locale";

type Props = {
  value: number;
  className?: string;
  /** Appended after the formatted number, e.g. "+" or "m". */
  suffix?: string;
  duration?: number;
};

/** Counts to a figure with a decelerating ramp, formatted for the locale. */
export default function AnimatedCounter({
  value,
  className = "",
  suffix = "",
  duration = 2.1,
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const { locale } = useLocale();

  useGsap(
    () => {
      const el = ref.current;
      if (!el) return;
      const fmt = new Intl.NumberFormat(locale === "ar" ? "ar-KW" : "en-US", {
        maximumFractionDigits: 0,
      });

      if (prefersReducedMotion()) {
        el.textContent = fmt.format(value) + suffix;
        return;
      }

      const obj = { n: 0 };
      gsap.to(obj, {
        n: value,
        duration,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: START, once: true },
        onUpdate: () => {
          el.textContent = fmt.format(Math.round(obj.n)) + suffix;
        },
      });
    },
    [value, locale, suffix]
  );

  return (
    <span ref={ref} className={`num ${className}`}>
      0{suffix}
    </span>
  );
}
