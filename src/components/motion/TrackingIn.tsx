"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion, useGsap, REVEAL } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import styles from "./TrackingIn.module.css";

type Props = {
  children: string;
  className?: string;
  size?: "mega" | "xl" | "lg";
  as?: "h1" | "h2" | "p";
  delay?: number;
  /** Starting letter-spacing in em. */
  from?: number;
};

/**
 * Display word that opens wide and closes to its final tracking. Latin only:
 * Arabic is a connected script, so per-character spacing would tear its
 * ligatures apart. In Arabic the same word rises under a mask instead.
 */
export default function TrackingIn({
  children,
  className = "",
  size = "xl",
  as: Tag = "h2",
  delay = 0,
  from = 0.42,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const { locale, version } = useLocale();
  const isArabic = locale === "ar";

  useGsap(
    () => {
      const el = ref.current;
      if (!el) return;
      const inner = el.querySelector<HTMLElement>("[data-track]");
      if (!inner) return;

      const st = { trigger: el, ...REVEAL } as const;

      if (prefersReducedMotion()) {
        gsap.fromTo(inner, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.28, scrollTrigger: st });
        return;
      }

      if (isArabic) {
        gsap.fromTo(
          inner,
          { yPercent: 110 },
          { yPercent: 0, duration: 0.55, ease: "power3.out", delay, scrollTrigger: st }
        );
        return;
      }

      /* Opening tracking has to be clamped to what actually fits.
         Letter-spacing changes layout width, and the line sits inside a mask
         with overflow hidden — so an opening value that is too wide for the
         column gets its tail clipped for the whole animation. Measure the
         natural width against the available width and spend only the slack
         that is genuinely there. */
      const available = (el.parentElement ?? el).clientWidth;
      const natural = inner.scrollWidth;
      const fontSize = parseFloat(getComputedStyle(inner).fontSize) || 16;
      const gaps = Math.max(1, children.length - 1);
      const slackEm = (available - natural) / (gaps * fontSize);
      const openFrom = Math.max(0, Math.min(from, slackEm));

      if (openFrom < 0.03) {
        /* Not enough room to read as a tracking move — rise under the mask
           instead of playing a version of the effect too small to notice. */
        gsap.fromTo(
          inner,
          { yPercent: 110 },
          { yPercent: 0, duration: 0.55, ease: "power3.out", delay, scrollTrigger: st }
        );
        return;
      }

      gsap.fromTo(
        inner,
        { letterSpacing: `${openFrom.toFixed(3)}em`, autoAlpha: 0, xPercent: -2 },
        {
          letterSpacing: "-0.03em",
          autoAlpha: 1,
          xPercent: 0,
          duration: 0.72,
          ease: "power3.out",
          delay,
          scrollTrigger: st,
        }
      );
    },
    [version, children, from]
  );

  return (
    <Tag ref={ref as React.Ref<never>} className={`display ${styles.wrap} ${className}`} data-size={size}>
      <span className={styles.mask}>
        <span data-track className={styles.track}>
          {children}
        </span>
      </span>
    </Tag>
  );
}
