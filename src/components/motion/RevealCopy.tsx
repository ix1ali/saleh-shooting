"use client";

import { useRef } from "react";
import { gsap, SplitText } from "@/lib/gsap";
import { EASE, START, prefersReducedMotion, useGsap } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import styles from "./RevealCopy.module.css";

type Props = {
  children: string;
  className?: string;
  delay?: number;
  /** "lines" reads fastest for body copy; "words" is for short emphatic lines. */
  mode?: "lines" | "words";
  size?: "body" | "small";
  id?: string;
};

/**
 * Body-copy reveal. Splits into lines and lifts them under a mask with a small
 * stagger, so the paragraph reads immediately instead of assembling word by
 * word. Splitting is by line/word only — never by character — because Arabic
 * is a connected script and per-character splitting destroys its ligatures.
 */
export default function RevealCopy({
  children,
  className = "",
  delay = 0,
  mode = "lines",
  size = "body",
  id,
}: Props) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const { version } = useLocale();

  useGsap(
    () => {
      const el = ref.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        gsap.fromTo(
          el,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.3, scrollTrigger: { trigger: el, start: START, once: true } }
        );
        return;
      }

      /* autoSplit re-runs the split whenever the element resizes or a webfont
         finally lands. Without it the line boxes stay frozen at whatever width
         they were first measured at, and after a rotation or a font swap the
         text overflows its column and gets clipped by the line masks. */
      const split = SplitText.create(el, {
        type: mode === "lines" ? "lines" : "words",
        linesClass: styles.splitLine,
        wordsClass: styles.splitWord,
        autoSplit: true,
        /* Keeps the accessible text intact for screen readers. */
        aria: "auto",
        onSplit(self) {
          const targets = mode === "lines" ? self.lines : self.words;
          return gsap.fromTo(
            targets,
            { yPercent: 105, autoAlpha: 0 },
            {
              yPercent: 0,
              autoAlpha: 1,
              duration: 0.95,
              ease: EASE.enter,
              stagger: mode === "lines" ? 0.075 : 0.035,
              delay,
              scrollTrigger: { trigger: el, start: START, once: true },
              onComplete: () => {
                gsap.set(targets, { clearProps: "transform,opacity,visibility" });
              },
            }
          );
        },
      });

      return () => {
        split.revert();
      };
    },
    [version, children, mode]
  );

  return (
    <p
      id={id}
      ref={ref}
      className={`body-copy ${styles.copy} ${className}`}
      data-size={size}
    >
      {children}
    </p>
  );
}
