"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { REVEAL, prefersReducedMotion, useGsap } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { info } from "@/data/site";
import MaskHeading from "@/components/motion/MaskHeading";
import ScrollLabel from "@/components/motion/ScrollLabel";
import styles from "./GoodToKnow.module.css";

/**
 * Section 05. The practical answers.
 *
 * This replaced a six-step rail with a travelling marker and glowing nodes.
 * The content was fine; presenting a list of facts as a staged event is what
 * made it read as a school project. It is a spec sheet now.
 */
export default function GoodToKnow() {
  const root = useRef<HTMLElement | null>(null);
  const { T, version } = useLocale();

  useGsap(
    () => {
      const el = root.current;
      if (!el) return;
      const rows = gsap.utils.toArray<HTMLElement>(`.${styles.row}`, el);
      if (!rows.length) return;

      if (prefersReducedMotion()) {
        gsap.fromTo(
          rows,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.22, stagger: 0.03, scrollTrigger: { trigger: el, ...REVEAL } }
        );
        return;
      }

      gsap.fromTo(
        rows,
        { autoAlpha: 0, y: 10 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.34,
          ease: "power3.out",
          stagger: 0.04,
          scrollTrigger: { trigger: el, ...REVEAL },
        }
      );
    },
    [version]
  );

  return (
    <section id="info" ref={root} className={styles.section} data-section="info">
      <div className={styles.head}>
        <ScrollLabel>{T(info.label)}</ScrollLabel>
        <MaskHeading as="h2" size="xl" lines={[T(info.heading)]} className={styles.heading} />
      </div>

      <div className={styles.rows}>
        {info.rows.map((r, i) => (
          <div key={i} className={styles.row}>
            <span className={styles.k}>{T(r.k)}</span>
            <span className={styles.v}>{T(r.v)}</span>
          </div>
        ))}
        {info.pending.map((r, i) => (
          <div key={`p-${i}`} className={styles.row} data-pending="true">
            <span className={styles.k}>{T(r.k)}</span>
            <span className={styles.v}>{T(r.v)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
