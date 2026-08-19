"use client";

import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { REVEAL, SCRUB, prefersReducedMotion, useGsap } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { contact, session, ui } from "@/data/site";
import MaskHeading from "@/components/motion/MaskHeading";
import ScrollLabel from "@/components/motion/ScrollLabel";
import RevealCopy from "@/components/motion/RevealCopy";
import ActionIcon from "@/components/ui/ActionIcon";
import styles from "./SessionSteps.module.css";

/**
 * Section 06. What actually happens on a first visit.
 *
 * This replaces an earlier abstract block about standards. Safety is covered
 * here as part of the sequence — kit before the line, a brief before live
 * fire — which is both more useful and more convincing than asserting it.
 */
export default function SessionSteps() {
  const root = useRef<HTMLElement | null>(null);
  const track = useRef<HTMLDivElement | null>(null);
  const [lit, setLit] = useState(-1);
  const { T, version } = useLocale();

  useGsap(
    () => {
      const el = root.current;
      const rail = track.current;
      if (!el || !rail) return;

      const steps = gsap.utils.toArray<HTMLElement>(`.${styles.step}`, el);
      const marker = rail.querySelector<HTMLElement>(`.${styles.marker}`);

      if (prefersReducedMotion()) {
        rail.style.setProperty("--lit", "1");
        rail.style.setProperty("--markerOn", "0");
        setLit(steps.length - 1);
        return;
      }

      /* Each step arrives on its own trigger. */
      steps.forEach((step) => {
        gsap.fromTo(
          step,
          { autoAlpha: 0, x: -16 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.42,
            ease: "power3.out",
            scrollTrigger: { trigger: step, ...REVEAL },
          }
        );
      });

      /* The round travels the rail, lighting nodes as it passes them. */
      const state = { p: 0 };
      gsap.to(state, {
        p: 1,
        ease: "none",
        onUpdate: () => {
          rail.style.setProperty("--lit", state.p.toFixed(4));
          rail.style.setProperty("--markerOn", state.p > 0.002 && state.p < 0.998 ? "1" : "0");
          if (marker) {
            const h = rail.clientHeight - 10;
            marker.style.transform = `translate3d(0, ${(state.p * h).toFixed(1)}px, 0)`;
          }
          const idx = Math.floor(state.p * steps.length + 0.18) - 1;
          setLit((prev) => (prev === idx ? prev : idx));
        },
        scrollTrigger: {
          trigger: rail,
          start: "top 72%",
          end: "bottom 78%",
          scrub: SCRUB.soft,
        },
      });

      const note = el.querySelector(`.${styles.note}`);
      if (note) {
        gsap.fromTo(
          note,
          { autoAlpha: 0, yPercent: 22 },
          {
            autoAlpha: 1,
            yPercent: 0,
            duration: 0.46,
            ease: "power3.out",
            scrollTrigger: { trigger: note, ...REVEAL },
          }
        );
      }
    },
    [version]
  );

  return (
    <section id="session" ref={root} className={styles.section} data-section="session">
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.head}>
        <ScrollLabel tone="accent">{T(session.label)}</ScrollLabel>
        <MaskHeading as="h2" size="xl" lines={[T(session.heading)]} className={styles.heading} />
        <RevealCopy className={styles.sub}>{T(session.body)}</RevealCopy>
      </div>

      <div ref={track} className={styles.track}>
        <span className={styles.rail} aria-hidden="true" />
        <span className={styles.railLit} aria-hidden="true" />
        <span className={styles.marker} aria-hidden="true" />

        {session.steps.map((s, i) => (
          <div key={s.n} className={styles.step} data-lit={i <= lit}>
            <span className={styles.node}>{s.n}</span>
            <div className={styles.stepBody}>
              <h3 className={styles.stepTitle}>{T(s.title)}</h3>
              <p className={styles.stepText}>{T(s.body)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.note}>
        <p className={styles.noteText}>{T(session.note)}</p>
        <a
          className={styles.noteCta}
          href={contact.instagram}
          target="_blank"
          rel="noreferrer noopener"
        >
          <ActionIcon name="instagram" />
          {T(ui.messageShort)}
          <svg width="12" height="9" viewBox="0 0 12 9" fill="none" aria-hidden="true">
            <path d="M0 4.5h10M7 1l3 3.5L7 8" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </a>
      </div>
    </section>
  );
}
