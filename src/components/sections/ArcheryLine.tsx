"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SCRUB, prefersReducedMotion, useGsap } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { archery, experiences } from "@/data/site";
import RevealCopy from "@/components/motion/RevealCopy";
import ScrollLabel from "@/components/motion/ScrollLabel";
import TargetRings from "@/components/motion/TargetRings";
import styles from "./ArcheryLine.module.css";

const TICKS = 7;

/**
 * Section 05b. One shared progress value drives three things at once: the
 * line draws, the arrow travels it, and the heading is uncovered behind the
 * arrow. Because they are the same number, the arrow genuinely appears to be
 * exposing the type rather than passing over it decoratively.
 */
export default function ArcheryLine() {
  const root = useRef<HTMLElement | null>(null);
  const { T, version } = useLocale();

  useGsap(
    () => {
      const el = root.current;
      if (!el) return;
      const arrow = el.querySelector<HTMLElement>(`.${styles.arrow}`);
      const rail = el.querySelector<HTMLElement>(`.${styles.rail}`);

      if (prefersReducedMotion()) {
        el.style.setProperty("--draw", "1");
        return;
      }

      const rtl = document.documentElement.dir === "rtl";
      const state = { p: 0 };

      gsap.to(state, {
        p: 1,
        ease: "none",
        /* Written from the tween, not the trigger — see RangeHero. */
        onUpdate: () => {
          el.style.setProperty("--draw", state.p.toFixed(4));
          if (arrow && rail) {
              /* Travel the full rail minus the arrow, so the head lands on
                 the far mark instead of overshooting past the edge. In Arabic
                 the arrow flies the other way and is mirrored with it. */
            const distance = rail.clientWidth - arrow.offsetWidth;
            const x = state.p * distance * (rtl ? -1 : 1);
            arrow.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)${rtl ? " scaleX(-1)" : ""}`;
          }
        },
        scrollTrigger: {
          trigger: el,
          start: "top 78%",
          end: "center 42%",
          scrub: SCRUB.soft,
        },
      });
    },
    [version]
  );

  const archeryExp = experiences.find((e) => e.id === "archery");

  return (
    <section ref={root} className={styles.section} data-section="archery">
      <div className={styles.ground} aria-hidden="true" />

      <ScrollLabel className={styles.label} tone="accent">
        {T(archery.label)}
      </ScrollLabel>

      <div className={styles.rail} aria-hidden="true">
        <span className={styles.railLine} />
        <span className={styles.railTicks}>
          {Array.from({ length: TICKS }).map((_, i) => (
            <span key={i} className={styles.railTick} />
          ))}
        </span>
        <span className={styles.arrow}>
          <svg viewBox="0 0 66 14" className={styles.arrowSvg} fill="none">
            <path d="M4 7 H 58" className={styles.arrowShaft} />
            <path d="M64 7 L 56 3 M64 7 L 56 11" className={styles.arrowHead} />
            <path d="M4 7 L 11 3 M4 7 L 11 11 M9 7 L 16 3 M9 7 L 16 11" className={styles.arrowFletch} />
          </svg>
        </span>
      </div>

      <div className={styles.content}>
        {/* No mask reveal here on purpose: this heading is uncovered by the
            arrow alone, so archery gets a motion language of its own rather
            than repeating the line-rise used everywhere else. */}
        <h2 className={`display ${styles.heading}`}>{T(archery.heading)}</h2>
        <RevealCopy className={styles.copy}>{T(archery.body)}</RevealCopy>

        <div className={styles.footer}>
          <TargetRings rings={4} weight={0.8} bullseye className={styles.footerRing} />
          <span className={styles.footerText}>
            {archeryExp ? T(archeryExp.kicker) : ""}
          </span>
        </div>
      </div>
    </section>
  );
}
