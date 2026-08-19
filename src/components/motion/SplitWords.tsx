"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { EASE,  prefersReducedMotion, useGsap, REVEAL } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import styles from "./SplitWords.module.css";

type Props = {
  words: string[];
  className?: string;
  size?: "mega" | "xl" | "lg" | "md";
  as?: "h1" | "h2" | "h3" | "p";
  delay?: number;
  /** Words snap onto a rigid grid rather than drifting — used by Standards. */
  variant?: "blur" | "lock";
  id?: string;
};

/**
 * Word-stagger reveal with a short blur-to-sharp pass. The blur runs only on
 * entrance and is cleared on completion, so no filter is ever animated
 * continuously during scroll.
 */
export default function SplitWords({
  words,
  className = "",
  size = "lg",
  as: Tag = "h2",
  delay = 0,
  variant = "blur",
  id,
}: Props) {
  const root = useRef<HTMLElement | null>(null);
  const { version } = useLocale();

  useGsap(
    () => {
      const el = root.current;
      if (!el) return;
      const items = el.querySelectorAll<HTMLElement>("[data-word]");
      if (!items.length) return;

      if (prefersReducedMotion()) {
        gsap.fromTo(
          items,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.26,
            stagger: 0.03,
            scrollTrigger: { trigger: el, ...REVEAL },
          }
        );
        return;
      }

      /* No blur pass. Animating a filter on type is both the slowest thing
         here and the one that makes a reveal look mushy. */
      const from =
        variant === "lock"
          ? { yPercent: 34, autoAlpha: 0 }
          : { yPercent: 52, autoAlpha: 0 };

      gsap.fromTo(items, from, {
        yPercent: 0,
        autoAlpha: 1,
        duration: variant === "lock" ? 0.4 : 0.44,
        ease: variant === "lock" ? "power3.out" : EASE.enter,
        stagger: variant === "lock" ? 0.05 : 0.032,
        delay,
        scrollTrigger: { trigger: el, ...REVEAL },
        /* Drop the filter entirely once settled so nothing keeps compositing. */
      });
    },
    [version, words.join("|"), variant]
  );

  return (
    <Tag
      id={id}
      ref={root as React.Ref<never>}
      className={`display ${styles.wrap} ${className}`}
      data-size={size}
    >
      {words.map((w, i) => (
        <span className={styles.slot} key={`${w}-${i}`}>
          <span data-word className={styles.word}>
            {w}
          </span>
        </span>
      ))}
    </Tag>
  );
}
