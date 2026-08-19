"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { SCRUB, prefersReducedMotion, useGsap } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { brand, hero as heroCopy, ui } from "@/data/site";
import { getOpenState, type OpenState } from "@/lib/hours";
import MaskHeading from "@/components/motion/MaskHeading";
import ScrollLabel from "@/components/motion/ScrollLabel";
import TargetRings from "@/components/motion/TargetRings";
import Photo from "@/components/visual/Photo";
import styles from "./RangeHero.module.css";

const INITIAL: OpenState = { open: null, today: null, boundary: null, now: null };

/**
 * Section 01.
 *
 * The opening frame is the facility's own lane, not an illustration of one.
 * Scroll drives a single push into it: the plate scales from its centre, the
 * room darkens around the edges, the type clears out, and the sighting rings
 * that have been sitting on the lane all along expand into the doorway that
 * carries the visitor into the next section.
 */
export default function RangeHero() {
  const root = useRef<HTMLElement | null>(null);
  const sticky = useRef<HTMLDivElement | null>(null);
  const { T, version } = useLocale();
  const [state, setState] = useState<OpenState>(INITIAL);

  /* Resolved client-side: the wall clock in Kuwait, not the visitor's. */
  useEffect(() => {
    const update = () => setState(getOpenState());
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);

  useGsap(
    () => {
      const el = root.current;
      const stage = sticky.current;
      if (!el || !stage) return;

      const set = (k: string, v: string | number) => stage.style.setProperty(k, String(v));

      if (prefersReducedMotion()) {
        set("--portalR", "0%");
        set("--sightOpacity", "0.7");
        return;
      }

      const s = { push: 0, portal: 0, rings: 0, ringScale: 0.05, sight: 0.7, sightScale: 1 };

      const apply = () => {
        set("--portalR", `${(s.portal * 155).toFixed(2)}%`);
        set("--ringsOpacity", s.rings.toFixed(3));
        set("--ringsScale", s.ringScale.toFixed(3));
        set("--sightOpacity", s.sight.toFixed(3));
        set("--sightScale", s.sightScale.toFixed(3));
      };
      apply();

      const plate = stage.querySelector(`.${styles.plate}`);
      const halo = stage.querySelector(`.${styles.halo}`);
      const hud = stage.querySelector(`.${styles.hud}`);
      const cue = stage.querySelector(`.${styles.cue}`);

      /* The scene is published from the timeline, never from the trigger: a
         scrubbed trigger fires on scroll while the playhead catches up on
         later ticks, which publishes stale values and freezes on stop. */
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        onUpdate: apply,
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: SCRUB.tight,
        },
      });

      /* 0.00 → 1.00 : one continuous push down the lane. */
      if (plate) tl.fromTo(plate, { scale: 1 }, { scale: 1.42, duration: 1 }, 0);
      if (halo) tl.fromTo(halo, { scale: 1.15 }, { scale: 1.5, duration: 1 }, 0);

      /* The type clears once the push has committed. */
      if (cue) tl.to(cue, { autoAlpha: 0, y: 22, duration: 0.08 }, 0.04);
      if (hud) tl.to(hud, { autoAlpha: 0, y: -46, duration: 0.2 }, 0.18);

      /* The sighting rings take the frame, then become the doorway. */
      tl.to(s, { sight: 1, sightScale: 1.5, duration: 0.34 }, 0.16)
        .to(s, { sightScale: 5.4, sight: 0, duration: 0.3 }, 0.5)
        .to(s, { ringScale: 1.9, duration: 0.34 }, 0.56)
        .to(s, { rings: 0.5, duration: 0.12 }, 0.56)
        .to(s, { rings: 0, duration: 0.16 }, 0.74)
        .to(s, { portal: 1, duration: 0.24, ease: "power2.in" }, 0.72);
    },
    [version]
  );

  /* Splitting on whitespace gives two display lines in both scripts. */
  const nameLines = T(brand.name).split(" ");

  const openLabel =
    state.open === null ? null : state.open ? T(ui.openNow) : T(ui.closedNow);

  return (
    <section id="hero" ref={root} className={styles.hero} data-section="hero">
      <div ref={sticky} className={styles.sticky}>
        <div className={styles.stage}>
          <div className={styles.plate}>
            <div className={styles.halo} aria-hidden="true">
              <Photo name="hero" alt="" grade="none" priority />
            </div>
            <Photo
              name="hero"
              alt={T(heroCopy.imageAlt)}
              grade="none"
              priority
              className={styles.plateImg}
            />
          </div>
        </div>

        <div className={styles.wash} aria-hidden="true" />
        <div className={styles.sweep} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.grain} aria-hidden="true" />

        <div className={styles.sight} aria-hidden="true">
          <div className={styles.sightPulse}>
            <TargetRings rings={5} weight={0.7} bullseye ticks />
          </div>
        </div>

        {/* ---- Type ---------------------------------------------------- */}
        <div className={styles.hud}>
          <ScrollLabel className={styles.eyebrow} tone="mist" delay={0.3}>
            {T(brand.city)}
          </ScrollLabel>

          <MaskHeading
            as="h1"
            size="mega"
            lines={nameLines}
            trigger="mount"
            delay={0.45}
            stagger={0.1}
            className={styles.wordmark}
          />

          <p className={`body-copy ${styles.support}`}>{T(heroCopy.support)}</p>

          <div className={styles.facts}>
            <span className={styles.fact} data-open={state.open === true}>
              <span className={styles.factDot} aria-hidden="true" />
              {openLabel ?? T(ui.today)}
            </span>
            <span className={styles.fact}>{T(heroCopy.factDisciplines)}</span>
            <span className={styles.fact}>{T(heroCopy.factGear)}</span>
          </div>
        </div>

        <div className={styles.cue}>
          <span className={styles.cueLabel}>{T(ui.scrollToEnter)}</span>
          <span className={styles.cueTrack}>
            <span className={styles.cueBead} />
          </span>
        </div>

        {/* ---- Doorway --------------------------------------------------- */}
        <TargetRings
          rings={9}
          weight={0.4}
          bullseye={false}
          className={styles.portalRings}
        />
        <div className={styles.portal}>
          <div className={styles.portalInner}>
            <Photo name="range" alt="" grade="heavy" position="center 44%" />
          </div>
        </div>
      </div>
    </section>
  );
}
