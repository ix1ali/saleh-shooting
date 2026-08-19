"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { REVEAL, prefersReducedMotion, useGsap } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { armoury, contact, ui } from "@/data/site";
import MaskHeading from "@/components/motion/MaskHeading";
import ScrollLabel from "@/components/motion/ScrollLabel";
import RevealCopy from "@/components/motion/RevealCopy";
import ArmSilhouette from "@/components/visual/ArmSilhouette";
import styles from "./Armoury.module.css";

/**
 * Section 04. The rack.
 *
 * Laid out as a catalogue rather than a gallery: each row is an outline, a
 * name, a chambering and the range it belongs to. Replace the rows in
 * `data/site.ts` with the real stock, and add photographs if you have them.
 */
export default function Armoury() {
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

      /* Rows settle in reading order, quickly. A catalogue should not perform. */
      gsap.fromTo(
        rows,
        { autoAlpha: 0, x: -10 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.34,
          ease: "power3.out",
          stagger: 0.035,
          scrollTrigger: { trigger: el, ...REVEAL },
        }
      );
    },
    [version]
  );

  return (
    <section id="armoury" ref={root} className={styles.section} data-section="armoury">
      <div className={styles.head}>
        <ScrollLabel>{T(armoury.label)}</ScrollLabel>
        <MaskHeading
          as="h2"
          size="xl"
          lines={[T(armoury.heading)]}
          className={styles.heading}
        />
        <RevealCopy className={styles.body}>{T(armoury.body)}</RevealCopy>
      </div>

      <div className={styles.list}>
        {armoury.items.map((item) => (
          <div key={item.id} className={styles.row}>
            <span className={styles.art}>
              <ArmSilhouette type={item.type} />
            </span>
            <span className={styles.name}>
              {item.name}
              <span className={styles.spec}>{item.spec}</span>
            </span>
            <span className={styles.range}>{T(item.range)}</span>
          </div>
        ))}
      </div>

      <p className={styles.disclaimer}>{T(armoury.disclaimer)}</p>

      <a
        className={styles.cta}
        href={contact.instagram}
        target="_blank"
        rel="noreferrer noopener"
      >
        {T(ui.messageShort)}
        <svg width="12" height="9" viewBox="0 0 12 9" fill="none" aria-hidden="true">
          <path d="M0 4.5h10M7 1l3 3.5L7 8" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </a>
    </section>
  );
}
