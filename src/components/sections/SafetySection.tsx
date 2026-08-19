"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SCRUB, prefersReducedMotion, useGsap } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { safety } from "@/data/site";
import SplitWords from "@/components/motion/SplitWords";
import RevealCopy from "@/components/motion/RevealCopy";
import ScrollLabel from "@/components/motion/ScrollLabel";
import Photo from "@/components/visual/Photo";
import styles from "./SafetySection.module.css";

/** Horizontal reference lines, as a fraction of the sheet height. */
const RULES = [0.13, 0.34, 0.62, 0.87];

export default function SafetySection() {
  const root = useRef<HTMLElement | null>(null);
  const { T, version } = useLocale();

  useGsap(
    () => {
      const el = root.current;
      if (!el) return;

      const lines = gsap.utils.toArray<SVGPathElement>(`.${styles.sheetLine}`, el);
      const ticks = gsap.utils.toArray<SVGPathElement>(`.${styles.sheetTick}`, el);
      const accents = gsap.utils.toArray<SVGPathElement>(`.${styles.sheetAccent}`, el);
      const points = gsap.utils.toArray<HTMLElement>(`.${styles.point}`, el);
      const underlay = el.querySelector(`.${styles.underlay}`);

      if (prefersReducedMotion()) {
        gsap.set([...lines, ...accents], { strokeDasharray: "none", strokeDashoffset: 0 });
        gsap.set(ticks, { autoAlpha: 1 });
        gsap.set(underlay, { autoAlpha: 0.85 });
        gsap.fromTo(
          points,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.3, stagger: 0.05, scrollTrigger: { trigger: el, start: "top 80%", once: true } }
        );
        return;
      }

      /* Each rule is drawn by retracting its own dash offset, so the lines
         genuinely draw rather than wipe under a mask. */
      [...lines, ...accents].forEach((path) => {
        const len = path.getTotalLength?.() ?? 0;
        if (!len) return;
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(ticks, { autoAlpha: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          end: "center 46%",
          scrub: SCRUB.soft,
        },
      });

      tl.to(lines, { strokeDashoffset: 0, duration: 1, stagger: 0.16, ease: "power2.inOut" }, 0)
        .to(ticks, { autoAlpha: 1, duration: 0.4, stagger: 0.03 }, 0.5)
        .to(accents, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, 0.7)
        /* The photograph beneath the drawing only appears once the drawing
           is essentially complete — the sheet becomes a window. */
        .to(underlay, { autoAlpha: 0.9, duration: 0.9 }, 0.85);

      /* Points arrive one at a time on their own triggers, so they read as a
         list being checked off rather than a block appearing at once. */
      points.forEach((p, i) => {
        gsap.fromTo(
          p,
          { autoAlpha: 0, x: -14 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.75,
            ease: "power3.out",
            delay: i * 0.05,
            scrollTrigger: { trigger: p, start: "top 90%", once: true },
          }
        );
      });
    },
    [version]
  );

  return (
    <section id="safety" ref={root} className={styles.section} data-section="safety">
      {/* The drawing becomes a window onto the range as it completes. */}
      <div className={styles.underlay} aria-hidden="true">
        <Photo name="pistol" alt="" grade="heavy" position="center 40%" />
      </div>

      <div className={styles.sheet} aria-hidden="true">
        <svg
          className={styles.sheetSvg}
          viewBox="0 0 100 200"
          preserveAspectRatio="none"
          fill="none"
        >
          {RULES.map((y, i) => (
            <path key={i} className={styles.sheetLine} d={`M0 ${y * 200} H 100`} />
          ))}
          {/* Vertical reference on the leading edge of the type column. */}
          <path className={styles.sheetAccent} d="M7 12 V 188" />
          {RULES.map((y, i) =>
            Array.from({ length: 9 }).map((_, k) => (
              <path
                key={`${i}-${k}`}
                className={styles.sheetTick}
                d={`M${10 + k * 10} ${y * 200 - 3} V ${y * 200 + 3}`}
              />
            ))
          )}
        </svg>
      </div>

      <div className={styles.content}>
        <ScrollLabel tone="accent">{T(safety.label)}</ScrollLabel>

        {/* Words lock onto the grid rather than drifting in — the "lock"
            variant exists for exactly this section. */}
        <SplitWords
          as="h2"
          size="lg"
          variant="lock"
          words={safety.headingWords.map(T)}
          className={styles.heading}
        />

        <RevealCopy className={styles.copy}>{T(safety.body)}</RevealCopy>

        <div className={styles.points}>
          {safety.points.map((p) => (
            <div key={p.n} className={styles.point}>
              <span className={styles.pointN}>{p.n}</span>
              <div>
                <h3 className={styles.pointTitle}>{T(p.title)}</h3>
                <p className={styles.pointBody}>{T(p.body)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
