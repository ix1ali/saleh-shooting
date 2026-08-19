"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion, useIsoLayoutEffect } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { ui } from "@/data/site";
import TargetRings from "@/components/motion/TargetRings";
import styles from "./SiteChrome.module.css";

/**
 * A ring that closes on its centre and then opens out of frame once the fonts
 * are in. It exists for one reason only: the hero measures type to build its
 * timeline, and the first paint in a fallback face would be visibly wrong.
 * It never waits longer than 1.6s, whatever the network is doing.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement | null>(null);
  const ring = useRef<HTMLDivElement | null>(null);
  const [done, setDone] = useState(false);
  const { T } = useLocale();

  useEffect(() => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      setDone(true);
    };

    const fonts = document.fonts?.ready ?? Promise.resolve();
    Promise.resolve(fonts).then(finish);
    /* Hard ceiling: a slow font never becomes a slow site. */
    const cap = window.setTimeout(finish, 1600);

    return () => window.clearTimeout(cap);
  }, []);

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      if (done) {
        gsap.set(el, { autoAlpha: 0, display: "none" });
        ScrollTrigger.refresh();
      }
      return;
    }

    if (!done) {
      gsap.fromTo(
        ring.current,
        { scale: 0.55, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.9, ease: "expo.out" }
      );
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(el, { display: "none" });
        /* Everything was measured behind the loader; remeasure now that the
           real type is on screen. */
        ScrollTrigger.refresh();
      },
    });

    tl.to(el.querySelector(`.${styles.loaderLabel}`), { autoAlpha: 0, duration: 0.3 }, 0)
      /* The ring opens past the frame — the same doorway gesture the hero
         uses at the end of the lane, played here as an entrance. */
      .to(ring.current, { scale: 18, autoAlpha: 0, duration: 1.05, ease: "expo.in" }, 0.05)
      .to(el, { autoAlpha: 0, duration: 0.45, ease: "power2.inOut" }, 0.5);
  }, [done]);

  return (
    <div ref={root} className={styles.loader} role="presentation">
      <div ref={ring} className={styles.loaderRing}>
        <TargetRings rings={6} weight={0.7} bullseye ticks />
      </div>
      <span className={styles.loaderLabel}>{T(ui.loading)}</span>
    </div>
  );
}
