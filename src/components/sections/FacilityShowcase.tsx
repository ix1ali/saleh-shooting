"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SCRUB, prefersReducedMotion, useGsap } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { facility } from "@/data/site";
import MaskHeading from "@/components/motion/MaskHeading";
import ScrollLabel from "@/components/motion/ScrollLabel";
import TargetRings from "@/components/motion/TargetRings";
import Photo from "@/components/visual/Photo";
import styles from "./FacilityShowcase.module.css";

const ART: Record<string, string> = {
  lane: styles.artLane,
  downrange: styles.artDownrange,
  bench: styles.artBench,
  score: styles.artScore,
};

/**
 * Section 05. Every frame runs its own three-part motion against its own
 * scroll progress: the window opens from a horizontal band, the picture
 * inside drifts against the frame, and the caption travels further and faster
 * than either. No two frames share a size, an aspect or a side of the page.
 */
export default function FacilityShowcase() {
  const root = useRef<HTMLElement | null>(null);
  const { T, version } = useLocale();

  useGsap(
    () => {
      const el = root.current;
      if (!el) return;
      const frames = gsap.utils.toArray<HTMLElement>(`.${styles.frame}`, el);

      frames.forEach((frame, i) => {
        const win = frame.querySelector(`.${styles.window}`);
        const media = frame.querySelector(`.${styles.media}`);
        const caption = frame.querySelector(`.${styles.caption}`);

        if (prefersReducedMotion()) {
          gsap.set(win, { clipPath: "inset(0% 0% 0% 0%)" });
          gsap.fromTo(
            frame,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.3, scrollTrigger: { trigger: frame, start: "top 85%", once: true } }
          );
          return;
        }

        /* The window opens from a letterbox band to the full frame — the
           strip literally unspooling rather than fading up. */
        if (win) {
          gsap.fromTo(
            win,
            { clipPath: "inset(42% 0% 42% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "power2.out",
              scrollTrigger: { trigger: frame, start: "top 92%", end: "top 42%", scrub: SCRUB.soft },
            }
          );
        }

        /* The picture moves against its frame for the whole pass. Alternating
           direction keeps the strip from developing a single drift. */
        if (media) {
          gsap.fromTo(
            media,
            { yPercent: i % 2 === 0 ? -8 : 8, scale: 1.1 },
            {
              yPercent: i % 2 === 0 ? 8 : -8,
              scale: 1,
              ease: "none",
              scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: SCRUB.tight },
            }
          );
        }

        /* Captions overtake their frames, so type and image never read as one
           pasted-down block. */
        if (caption) {
          gsap.fromTo(
            caption,
            { yPercent: 90, autoAlpha: 0 },
            {
              yPercent: -40,
              autoAlpha: 1,
              ease: "none",
              scrollTrigger: { trigger: frame, start: "top 88%", end: "bottom 30%", scrub: SCRUB.tight },
            }
          );
        }
      });
    },
    [version]
  );

  return (
    <section id="facility" ref={root} className={styles.section} data-section="facility">
      <div className={styles.head}>
        <ScrollLabel>{T(facility.label)}</ScrollLabel>
        <MaskHeading as="h2" size="mega" lines={[T(facility.heading)]} className={styles.heading} />
      </div>

      <div className={styles.strip}>
        {facility.frames.map((f, i) => (
          <figure key={f.id} className={styles.frame}>
            <div className={styles.window}>
              <div className={styles.media}>
                {f.image ? (
                  <Photo name={f.image} alt={T(f.caption)} grade="none" />
                ) : (
                  <div className={`${styles.art} ${ART[f.visual]}`} aria-hidden="true">
                    <TargetRings
                      rings={5}
                      weight={0.5}
                      bullseye={false}
                      className={styles.artRing}
                    />
                  </div>
                )}
                <div className={styles.artGrade} aria-hidden="true" />
              </div>
            </div>

            <figcaption className={styles.caption}>
              <span className={styles.capIndex}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.capText}>
                <span className={styles.capTitle}>{T(f.caption)}</span>
                <span className={styles.capMeta}>{T(f.meta)}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
