"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { EASE, START, prefersReducedMotion, useGsap } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import styles from "./ScrollLabel.module.css";

type Props = {
  children: string;
  className?: string;
  delay?: number;
  /** Rule sits before the label (default) or is omitted entirely. */
  rule?: boolean;
  tone?: "mist" | "accent" | "bone";
};

/**
 * Small section label. The hairline draws out first, then the text follows it
 * in — so the eye is led along the rule to the word, the way a range marking
 * leads to a lane number.
 */
export default function ScrollLabel({
  children,
  className = "",
  delay = 0,
  rule = true,
  tone = "mist",
}: Props) {
  const root = useRef<HTMLDivElement | null>(null);
  const { version } = useLocale();

  useGsap(
    () => {
      const el = root.current;
      if (!el) return;
      const line = el.querySelector<HTMLElement>("[data-rule]");
      const text = el.querySelector<HTMLElement>("[data-text]");
      if (!text) return;

      const st = { trigger: el, start: START, once: true } as const;

      if (prefersReducedMotion()) {
        gsap.fromTo([line, text].filter(Boolean), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.26, scrollTrigger: st });
        return;
      }

      const tl = gsap.timeline({ scrollTrigger: st, delay });
      if (line) {
        tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: EASE.inOut });
      }
      tl.fromTo(
        text,
        { xPercent: -14, autoAlpha: 0 },
        { xPercent: 0, autoAlpha: 1, duration: 0.7, ease: EASE.enter },
        line ? "-=0.45" : 0
      );
    },
    [version, children]
  );

  return (
    <div ref={root} className={`${styles.wrap} ${className}`} data-tone={tone}>
      {rule && <span data-rule className={styles.rule} aria-hidden="true" />}
      <span data-text className={`label ${styles.text}`}>
        {children}
      </span>
    </div>
  );
}
