"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { START, prefersReducedMotion, useGsap } from "@/lib/motion";
import styles from "./RollingNumber.module.css";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

type Props = {
  /** Any string; digits roll, everything else stays put. e.g. "10:00" */
  value: string;
  className?: string;
  size?: "lg" | "xl" | "mega";
  delay?: number;
  ariaLabel?: string;
};

/**
 * Mechanical counter. Each digit is a vertical strip of 0-9 that rolls to its
 * final position, the way a range scoreboard settles. Only transforms move.
 */
export default function RollingNumber({
  value,
  className = "",
  size = "lg",
  delay = 0,
  ariaLabel,
}: Props) {
  const root = useRef<HTMLSpanElement | null>(null);

  useGsap(
    () => {
      const el = root.current;
      if (!el) return;
      const strips = el.querySelectorAll<HTMLElement>("[data-strip]");
      if (!strips.length) return;

      const st = { trigger: el, start: START, once: true } as const;

      if (prefersReducedMotion()) {
        strips.forEach((s) => {
          const target = Number(s.dataset.value);
          gsap.set(s, { yPercent: -10 * target });
        });
        gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, scrollTrigger: st });
        return;
      }

      const tl = gsap.timeline({ scrollTrigger: st, delay });
      strips.forEach((s, i) => {
        const target = Number(s.dataset.value);
        tl.fromTo(
          s,
          /* Start a full wheel early so it reads as a roll, not a jump. */
          { yPercent: -10 * target + 100 },
          { yPercent: -10 * target, duration: 1.15, ease: "power4.out" },
          i * 0.085
        );
      });
    },
    [value]
  );

  const chars = value.split("");

  return (
    <span
      ref={root}
      className={`num ${styles.wrap} ${className}`}
      data-size={size}
      aria-label={ariaLabel ?? value}
      role="text"
    >
      {chars.map((c, i) => {
        const isDigit = /[0-9]/.test(c);
        if (!isDigit) {
          return (
            <span key={`${c}-${i}`} className={styles.static} aria-hidden="true">
              {c}
            </span>
          );
        }
        return (
          <span key={`${c}-${i}`} className={styles.window} aria-hidden="true">
            <span data-strip data-value={c} className={styles.strip}>
              {DIGITS.map((d) => (
                <span key={d} className={styles.digit}>
                  {d}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
