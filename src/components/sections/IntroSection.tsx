"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SCRUB, prefersReducedMotion, useGsap } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { intro } from "@/data/site";
import MaskHeading from "@/components/motion/MaskHeading";
import RevealCopy from "@/components/motion/RevealCopy";
import ScrollLabel from "@/components/motion/ScrollLabel";
import AnimatedCounter from "@/components/motion/AnimatedCounter";
import TargetRings from "@/components/motion/TargetRings";
import Photo from "@/components/visual/Photo";
import styles from "./IntroSection.module.css";

/**
 * Section 02. Arrives directly out of the hero portal — it shares the same
 * ground, so the cut is invisible. Three depth layers move at three speeds:
 * the ground drifts slowest, the ring turns in the middle distance, the type
 * sits in front and assembles line by line.
 */
export default function IntroSection() {
  const root = useRef<HTMLElement | null>(null);
  const ground = useRef<HTMLDivElement | null>(null);
  const groundScale = useRef<HTMLDivElement | null>(null);
  const ring = useRef<HTMLDivElement | null>(null);
  const { T, version } = useLocale();

  useGsap(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;

      /* Ground settles from an over-scale as the section is read, then keeps
         drifting against the page for the rest of the scroll. */
      if (groundScale.current) {
        gsap.fromTo(
          groundScale.current,
          { scale: 1.12 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "center center", scrub: SCRUB.soft },
          }
        );
      }

      if (ground.current) {
        gsap.fromTo(
          ground.current,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: SCRUB.tight },
          }
        );
      }

      /* The ring turns slowly and travels across the frame — the brand motif
         moving through the composition rather than sitting as decoration. */
      if (ring.current) {
        gsap.fromTo(
          ring.current,
          { rotate: -14, xPercent: 6, yPercent: -4 },
          {
            rotate: 10,
            xPercent: -10,
            yPercent: 6,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: SCRUB.tight },
          }
        );
      }

      /* The whole composition lifts away as the next section arrives, so the
         two sections overlap instead of butting against each other. */
      gsap.to(el.querySelector(`.${styles.content}`), {
        yPercent: -13,
        autoAlpha: 0.25,
        ease: "none",
        scrollTrigger: { trigger: el, start: "bottom 88%", end: "bottom 20%", scrub: SCRUB.soft },
      });
    },
    [version]
  );

  return (
    <section id="intro" ref={root} className={styles.intro} data-section="intro">
      <div ref={ground} className={styles.groundWrap} aria-hidden="true">
        <div ref={groundScale} className={styles.groundScale}>
          <Photo name="range" alt="" grade="heavy" position="center 42%" />
        </div>
      </div>

      <div className={styles.scrim} aria-hidden="true" />

      <div ref={ring} className={styles.ring} aria-hidden="true">
        <TargetRings rings={8} weight={0.35} bullseye={false} />
      </div>

      <div className={styles.content}>
        <ScrollLabel className={styles.label}>{T(intro.label)}</ScrollLabel>

        <MaskHeading
          as="h2"
          size="mega"
          lines={intro.headingLines.map(T)}
          stagger={0.1}
          className={styles.heading}
        />

        <RevealCopy className={styles.copy}>{T(intro.body)}</RevealCopy>

        <div className={styles.stat}>
          <AnimatedCounter value={intro.statValue} suffix="+" className={styles.statValue} />
          <span className={styles.statLabel}>{T(intro.statLabel)}</span>
        </div>
      </div>
    </section>
  );
}
