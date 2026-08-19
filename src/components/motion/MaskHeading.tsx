"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { DUR, EASE, START, prefersReducedMotion, useGsap } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import styles from "./MaskHeading.module.css";

type Size = "mega" | "xl" | "lg" | "md";

type Props = {
  lines: string[];
  size?: Size;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** Delay before the first line moves. */
  delay?: number;
  /** Per-line offset. Larger = more deliberate. */
  stagger?: number;
  /** Animate on scroll into view (default) or immediately. */
  trigger?: "scroll" | "mount" | "none";
  /** Align each line's mask origin. */
  align?: "start" | "center";
  id?: string;
};

/**
 * Line-mask reveal — each line begins fully below a clipping edge and rises
 * into position. The signature entrance for display type across the site.
 */
export default function MaskHeading({
  lines,
  size = "xl",
  as: Tag = "h2",
  className = "",
  delay = 0,
  stagger = 0.085,
  trigger = "scroll",
  align = "start",
  id,
}: Props) {
  const root = useRef<HTMLElement | null>(null);
  const { version } = useLocale();

  useGsap(
    () => {
      const el = root.current;
      if (!el || trigger === "none") return;
      const inner = el.querySelectorAll<HTMLElement>("[data-line]");
      if (!inner.length) return;

      if (prefersReducedMotion()) {
        gsap.fromTo(
          inner,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.28,
            stagger: 0.04,
            scrollTrigger:
              trigger === "scroll" ? { trigger: el, start: START, once: true } : undefined,
          }
        );
        return;
      }

      gsap.fromTo(
        inner,
        { yPercent: 112 },
        {
          yPercent: 0,
          duration: DUR.slow,
          ease: EASE.enter,
          stagger,
          delay,
          scrollTrigger:
            trigger === "scroll"
              ? { trigger: el, start: START, once: true }
              : undefined,
        }
      );
    },
    [version, lines.join("|"), trigger]
  );

  return (
    <Tag
      id={id}
      ref={root as React.Ref<never>}
      className={`display ${styles.heading} ${className}`}
      data-size={size}
      data-align={align}
    >
      {lines.map((line, i) => (
        <span className={styles.mask} key={`${line}-${i}`}>
          <span data-line className={styles.line}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
