"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SCRUB, prefersReducedMotion, useGsap } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { experiences, experiencesSection } from "@/data/site";
import DisciplineArt from "@/components/visual/DisciplineArt";
import ScrollLabel from "@/components/motion/ScrollLabel";
import styles from "./ExperienceStory.module.css";

const PANELS = experiences.filter((e) => e.enabled);

/** Scroll runway given to each lane change, in svh. */
const PER_PANEL = 92;

/**
 * Section 03. The pin is short and finite: one screen of runway per lane
 * change, so the visitor is never held longer than it takes to look at each
 * discipline once.
 */
export default function ExperienceStory() {
  const root = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(0);
  const { T, version } = useLocale();

  useGsap(
    () => {
      const el = root.current;
      if (!el) return;
      const panels = gsap.utils.toArray<HTMLElement>(`.${styles.panel}`, el);
      if (panels.length < 2) return;

      const steps = panels.length - 1;

      if (prefersReducedMotion()) {
        /* No stacking. Each panel simply becomes visible in turn, driven by
           position rather than by a scrubbed transform. */
        panels.forEach((p, i) => {
          gsap.set(p, { yPercent: 0, autoAlpha: i === 0 ? 1 : 0 });
          if (i === 0) return;
          ScrollTrigger.create({
            trigger: el,
            start: () => `top+=${(i - 0.5) * window.innerHeight * (PER_PANEL / 100)} top`,
            end: () => `top+=${(i + 0.5) * window.innerHeight * (PER_PANEL / 100)} top`,
            onToggle: (self) => {
              gsap.to(panels, { autoAlpha: 0, duration: 0.2, overwrite: true });
              gsap.to(panels[self.isActive ? i : i - 1], { autoAlpha: 1, duration: 0.2 });
              setActive(self.isActive ? i : i - 1);
            },
          });
        });
        return;
      }

      /* Start every panel below the frame except the first. */
      panels.forEach((p, i) => gsap.set(p, { yPercent: i === 0 ? 0 : 100, zIndex: i + 1 }));

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: SCRUB.tight,
          onUpdate: (self) => {
            const i = Math.min(steps, Math.round(self.progress * steps));
            setActive((prev) => (prev === i ? prev : i));
          },
        },
      });

      /* The section heading leaves as soon as the first lane change begins. */
      tl.to(
        el.querySelector(`.${styles.intro}`),
        { autoAlpha: 0, y: -30, duration: 0.12 },
        0
      );

      panels.forEach((panel, i) => {
        if (i === 0) return;
        const at = (i - 1) / steps;
        const span = 1 / steps;
        const prev = panels[i - 1];

        /* Incoming lane rises to fill the frame. */
        tl.to(panel, { yPercent: 0, duration: span }, at);

        /* Outgoing lane keeps moving up, but slower — the parallax that makes
           the two feel like separate physical surfaces rather than slides. */
        tl.to(prev, { yPercent: -34, duration: span }, at);
        tl.to(prev.querySelector(`.${styles.shade}`), { opacity: 0.72, duration: span }, at);

        /* The artwork settles out of an over-scale as its lane arrives. */
        tl.fromTo(
          panel.querySelector(`.${styles.mediaInner}`),
          { scale: 1.16 },
          { scale: 1, duration: span },
          at
        );

        /* Title and copy arrive after the panel has mostly landed, so the
           type is never read while it is still travelling. */
        tl.fromTo(
          panel.querySelector(`.${styles.title}`),
          { yPercent: 108 },
          { yPercent: 0, duration: span * 0.42, ease: "power3.out" },
          at + span * 0.42
        );
        tl.fromTo(
          panel.querySelector(`.${styles.copy}`),
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: span * 0.5, ease: "power3.out" },
          at + span * 0.5
        );
      });
    },
    [version]
  );

  return (
    <section
      id="experiences"
      ref={root}
      className={styles.wrap}
      data-section="experiences"
      style={{ height: `calc(100svh + ${(PANELS.length - 1) * PER_PANEL}svh)` }}
    >
      <div className={styles.sticky}>
        <div className={styles.panels}>
          {PANELS.map((exp) => (
            <article key={exp.id} className={styles.panel}>
              <div className={styles.media}>
                <div className={styles.mediaInner}>
                  <DisciplineArt
                    visual={exp.visual}
                    image={exp.image}
                    alt={T(exp.title)}
                  />
                </div>
                <div className={styles.shade} />
              </div>

              <div className={styles.body}>
                <div className={styles.head}>
                  <span className={styles.index}>{exp.index}</span>
                  <span className={styles.kicker}>{T(exp.kicker)}</span>
                </div>
                <span className={styles.titleMask}>
                  <span className={styles.title}>{T(exp.title)}</span>
                </span>
                <p className={`body-copy ${styles.copy}`}>{T(exp.body)}</p>
                <div className={styles.facts}>
                  {exp.facts.map((f, k) => (
                    <span key={k} className={styles.fact}>
                      {T(f)}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Range marks down the edge: which lane you are standing in. */}
        <div className={styles.lanes} aria-hidden="true">
          {PANELS.map((exp, i) => (
            <span key={exp.id} className={styles.lane} data-active={i === active}>
              <span>{exp.index}</span>
              <span className={styles.laneTick} />
            </span>
          ))}
        </div>

        <div className={styles.intro}>
          <ScrollLabel tone="bone">{T(experiencesSection.label)}</ScrollLabel>
          <span className={styles.introHeading}>{T(experiencesSection.heading)}</span>
        </div>
      </div>
    </section>
  );
}
