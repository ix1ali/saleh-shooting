"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { EASE, REVEAL, SCRUB, prefersReducedMotion, useGsap } from "@/lib/motion";
import styles from "./MaskReveal.module.css";

type Shape = "up" | "wipe" | "iris" | "bars";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Which geometry the content is uncovered by. */
  shape?: Shape;
  delay?: number;
  /** Scrub the reveal against scroll instead of playing it once. */
  scrub?: boolean;
  /** Inner content drifts from this scale to 1 as it is uncovered. */
  scaleFrom?: number;
};

const FROM: Record<Shape, string> = {
  up: "inset(100% 0% 0% 0%)",
  wipe: "inset(0% 100% 0% 0%)",
  iris: "circle(0% at 50% 50%)",
  bars: "inset(0% 0% 100% 0%)",
};

const TO: Record<Shape, string> = {
  up: "inset(0% 0% 0% 0%)",
  wipe: "inset(0% 0% 0% 0%)",
  iris: "circle(75% at 50% 50%)",
  bars: "inset(0% 0% 0% 0%)",
};

/**
 * Images never simply fade in. They are uncovered by a moving edge, an iris,
 * or a wipe, while the content inside drifts down from a slight over-scale so
 * the frame and its contents move at different speeds.
 */
export default function MaskReveal({
  children,
  className = "",
  shape = "up",
  delay = 0,
  scrub = false,
  scaleFrom = 1.14,
}: Props) {
  const root = useRef<HTMLDivElement | null>(null);

  useGsap(
    () => {
      const el = root.current;
      if (!el) return;
      const inner = el.querySelector<HTMLElement>("[data-mask-inner]");

      if (prefersReducedMotion()) {
        gsap.set(el, { clipPath: TO[shape] });
        gsap.fromTo(
          el,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.3, scrollTrigger: { trigger: el, ...REVEAL } }
        );
        return;
      }

      if (scrub) {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 92%", end: "top 30%", scrub: SCRUB.soft },
        });
        tl.fromTo(el, { clipPath: FROM[shape] }, { clipPath: TO[shape], ease: "none" }, 0);
        if (inner) tl.fromTo(inner, { scale: scaleFrom }, { scale: 1, ease: "none" }, 0);
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, ...REVEAL },
        delay,
      });
      tl.fromTo(
        el,
        { clipPath: FROM[shape] },
        { clipPath: TO[shape], duration: 1.25, ease: EASE.enter },
        0
      );
      if (inner) {
        tl.fromTo(inner, { scale: scaleFrom }, { scale: 1, duration: 1.6, ease: EASE.enter }, 0);
      }
    },
    [shape, scrub]
  );

  return (
    <div ref={root} className={`${styles.mask} ${className}`}>
      <div data-mask-inner className={styles.inner}>
        {children}
      </div>
    </div>
  );
}
