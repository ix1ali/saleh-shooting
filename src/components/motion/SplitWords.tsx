"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { EASE, START, prefersReducedMotion, useGsap } from "@/lib/motion";
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
            scrollTrigger: { trigger: el, start: START, once: true },
          }
        );
        return;
      }

      const from =
        variant === "lock"
          ? { yPercent: 40, autoAlpha: 0, filter: "blur(0px)" }
          : { yPercent: 60, autoAlpha: 0, filter: "blur(9px)" };

      gsap.fromTo(items, from, {
        yPercent: 0,
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: variant === "lock" ? 0.7 : 1.0,
        ease: variant === "lock" ? "power4.out" : EASE.enter,
        stagger: variant === "lock" ? 0.11 : 0.06,
        delay,
        scrollTrigger: { trigger: el, start: START, once: true },
        /* Drop the filter entirely once settled so nothing keeps compositing. */
        onComplete: () => {
          gsap.set(items, { clearProps: "filter,willChange" });
        },
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
