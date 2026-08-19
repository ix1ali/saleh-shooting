"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { REVEAL, prefersReducedMotion, useGsap } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { contact, experiences, experiencesSection } from "@/data/site";
import MaskHeading from "@/components/motion/MaskHeading";
import ScrollLabel from "@/components/motion/ScrollLabel";
import RevealCopy from "@/components/motion/RevealCopy";
import Photo from "@/components/visual/Photo";
import styles from "./RangesGrid.module.css";

const RANGES = experiences.filter((e) => e.enabled);

/**
 * Section 03. The four ranges, as a square grid.
 *
 * Deliberately plain. This replaced a pinned sequence that held the page for
 * four full screens to communicate the same four words, which made the site
 * feel like it was performing at the visitor rather than informing them. The
 * cards carry a photograph and a name; anything longer belongs in a message.
 */
export default function RangesGrid() {
  const root = useRef<HTMLElement | null>(null);
  const { T, version } = useLocale();

  useGsap(
    () => {
      const el = root.current;
      if (!el) return;
      const cards = gsap.utils.toArray<HTMLElement>(`.${styles.card}`, el);
      if (!cards.length) return;

      if (prefersReducedMotion()) {
        gsap.fromTo(
          cards,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.25, stagger: 0.04, scrollTrigger: { trigger: el, ...REVEAL } }
        );
        return;
      }

      /* One short move for the whole grid. Cards settle in reading order. */
      gsap.fromTo(
        cards,
        { yPercent: 12, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.45,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: { trigger: el, ...REVEAL },
        }
      );
    },
    [version]
  );

  return (
    <section id="experiences" ref={root} className={styles.section} data-section="experiences">
      <div className={styles.head}>
        <ScrollLabel>{T(experiencesSection.label)}</ScrollLabel>
        <MaskHeading
          as="h2"
          size="xl"
          lines={[T(experiencesSection.heading)]}
          className={styles.heading}
        />
      </div>

      <div className={styles.grid}>
        {RANGES.map((r) => (
          <a
            key={r.id}
            className={styles.card}
            href={contact.instagram}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={T(r.title)}
          >
            <div className={styles.media}>
              <Photo name={r.image ?? "range"} alt="" grade="none" mono />
            </div>
            <span className={styles.tint} aria-hidden="true" />
            <span className={styles.index}>{r.index}</span>
            <span className={styles.label}>
              <span className={styles.title}>{T(r.title)}</span>
              <span className={styles.sub}>{T(r.kicker)}</span>
            </span>
            <span className={styles.edge} aria-hidden="true" />
          </a>
        ))}
      </div>

      <RevealCopy className={styles.note}>{T(experiencesSection.note)}</RevealCopy>
    </section>
  );
}
