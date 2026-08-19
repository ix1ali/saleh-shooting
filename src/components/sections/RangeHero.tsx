"use client";

import { Fragment, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SCRUB, prefersReducedMotion, useGsap } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { brand, hero as heroCopy, ui } from "@/data/site";
import MaskHeading from "@/components/motion/MaskHeading";
import ScrollLabel from "@/components/motion/ScrollLabel";
import TargetRings from "@/components/motion/TargetRings";
import Photo from "@/components/visual/Photo";
import styles from "./RangeHero.module.css";

/* -------------------------------------------------------------------------
   Lane geometry, in CSS-3D units. One unit is one CSS pixel at the camera
   plane; perspective is 300, so an object at depth d appears at scale 300/d.
   ---------------------------------------------------------------------- */

const LANE = {
  width: 320,
  /* A tighter corridor. The taller room read as a cavern: the ceiling plane
     swallowed the top third of the frame as dead black space. */
  height: 232,
  length: 4200,
  floorY: 118,
  ceilY: -114,
  targetZ: -3200,
  backZ: -3420,
};

/**
 * How far the camera travels.
 *
 * The target sits at z = -3200, so the camera passes that plane and finishes
 * 200 units in front of it. Under CSS perspective an object scales by
 * p / (p - z), which at p = 300 and z = +200 is 3x — the point at which the
 * 190-unit target finally exceeds the width of the phone and the bullseye
 * genuinely owns the frame. Stopping at the target plane would top out near
 * half the screen width, which is not a takeover.
 */
const CAM_END = 3400;

/* Depths of the furniture that gives the lane its parallax. */
const DIVIDERS = [420, 780, 1140, 1500, 1860, 2220, 2580, 2940];
const LIGHTS = [300, 700, 1100, 1500, 1900, 2300, 2700, 3100];
const MARKERS = [900, 1800, 2700];

export default function RangeHero() {
  const root = useRef<HTMLElement | null>(null);
  const sticky = useRef<HTMLDivElement | null>(null);
  const { T, version } = useLocale();

  useGsap(
    () => {
      const el = root.current;
      const stage = sticky.current;
      if (!el || !stage) return;

      const set = (k: string, v: string | number) => stage.style.setProperty(k, String(v));

      /* Reduced motion: present the lane already lit, at a mid-depth, with no
         scrubbing at all. The composition still reads; it simply holds still. */
      if (prefersReducedMotion()) {
        set("--camN", 1500);
        set("--sceneOn", 1);
        set("--lightsOn", 1);
        set("--portalR", "0%");
        return;
      }

      const cam = { n: 0, scene: 0.62, lights: 0.55, portal: 0, rings: 0, ringScale: 0.06 };

      const apply = () => {
        set("--camN", cam.n.toFixed(1));
        set("--sceneOn", cam.scene.toFixed(3));
        set("--lightsOn", cam.lights.toFixed(3));
        set("--portalR", `${(cam.portal * 155).toFixed(2)}%`);
        set("--ringsOpacity", cam.rings.toFixed(3));
        set("--ringsScale", cam.ringScale.toFixed(3));
      };
      apply();

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        /* The scene is written from the timeline, never from the trigger.
           With a scrubbed timeline the trigger fires on scroll, while the
           playhead catches up on the following ticks — so writing from the
           trigger publishes the previous frame and, once scrolling stops,
           stops firing entirely and leaves the camera wherever it last was. */
        onUpdate: apply,
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: SCRUB.tight,
        },
      });

      /* --- 0.00 → 0.15 : the room wakes up ---------------------------- */
      tl.to(cam, { scene: 1, duration: 0.08 }, 0)
        .to(cam, { lights: 1, duration: 0.14, ease: "power2.inOut" }, 0.01)
        /* Camera only creeps here — the eye should settle on the type first. */
        .to(cam, { n: 190, duration: 0.15 }, 0);

      /* --- 0.15 → 0.45 : the advance ---------------------------------- */
      tl.to(cam, { n: 1600, duration: 0.30 }, 0.15);

      /* Hero type leaves as the camera commits to the lane. */
      tl.to(
        stage.querySelector(`.${styles.cue}`),
        { autoAlpha: 0, y: 26, duration: 0.06 },
        0.06
      ).to(
        stage.querySelector(`.${styles.hud}`),
        { autoAlpha: 0, y: -54, scale: 0.965, duration: 0.16 },
        0.17
      );

      /* --- 0.45 → 0.88 : the target takes the frame --------------------
         Apparent size grows as 1 / (3500 - camN), so a constant camera speed
         would read as a slow crawl that suddenly lunges. The travel is split
         and the final leg decelerates, which keeps the perceived rate of
         approach roughly even all the way in. */
      tl.to(cam, { n: 2620, duration: 0.27 }, 0.45)
        .to(cam, { n: 3150, duration: 0.16 }, 0.72)
        .to(cam, { n: CAM_END, duration: 0.12, ease: "power2.out" }, 0.88);

      /* --- 0.76 → 1.00 : the bullseye becomes the doorway --------------
         The portal opens over the fastest part of the approach, so the two
         movements compound instead of competing. */
      tl.to(cam, { portal: 1, duration: 0.16, ease: "power2.in" }, 0.84)
        .to(cam, { ringScale: 1.8, duration: 0.24 }, 0.76)
        .to(cam, { rings: 0.55, duration: 0.09 }, 0.76)
        .to(cam, { rings: 0, duration: 0.11 }, 0.87);
    },
    [version]
  );

  /* Splitting on whitespace gives two display lines in both scripts. */
  const nameLines = T(brand.name).split(" ");

  return (
    <section
      id="hero"
      ref={root}
      className={styles.hero}
      aria-label={T(brand.name)}
      data-section="hero"
    >
      <div
        ref={sticky}
        className={styles.sticky}
        style={
          {
            "--laneW": `${LANE.width}px`,
            "--laneH": `${LANE.height}px`,
            "--laneLen": `${LANE.length}px`,
            "--floorY": `${LANE.floorY}px`,
            "--ceilY": `${LANE.ceilY}px`,
            "--wallNeg": `${-LANE.width / 2}px`,
            "--wallPos": `${LANE.width / 2}px`,
            "--backZ": `${LANE.backZ}px`,
            "--targetZ": `${LANE.targetZ}px`,
          } as React.CSSProperties
        }
      >
        <div className={styles.world}>
          <div className={styles.camera}>
            <div className={`${styles.plane} ${styles.floor}`} />
            <div className={`${styles.plane} ${styles.ceiling}`} />
            <div className={`${styles.plane} ${styles.wall} ${styles.wallL}`} />
            <div className={`${styles.plane} ${styles.wall} ${styles.wallR}`} />
            <div className={`${styles.plane} ${styles.backwall}`}>
              <Photo
                name="range"
                alt=""
                grade="heavy"
                priority
                position="center 40%"
                className={styles.backwallPhoto}
              />
            </div>

            {/* Booth dividers, mirrored down both walls. Each fades out just
                before the camera would pass through it, so nothing ever
                explodes across the frame at the camera plane. */}
            {DIVIDERS.map((d) =>
              [-1, 1].map((side) => (
                <div
                  key={`div-${d}-${side}`}
                  className={styles.divider}
                  style={
                    {
                      transform: `translate3d(${side * (LANE.width / 2 - 18)}px, 0, ${-d}px)`,
                      opacity: `calc((${d} - 300 - var(--camN, 0)) / 420 * var(--sceneOn, 0))`,
                    } as React.CSSProperties
                  }
                />
              ))
            )}

            {/* Overhead housings and the pool each one lays on the floor. */}
            {/* A Fragment, never a wrapper div: any element without
                transform-style: preserve-3d would flatten these back into a
                single plane and collapse the depth. */}
            {LIGHTS.map((d) => (
              <Fragment key={`lt-${d}`}>
                <div
                  className={styles.light}
                  style={
                    {
                      transform: `translate3d(0, ${LANE.ceilY + 8}px, ${-d}px)`,
                      opacity: `calc((${d} - 240 - var(--camN, 0)) / 380 * var(--lightsOn, 0))`,
                    } as React.CSSProperties
                  }
                />
                <div
                  className={styles.pool}
                  style={
                    {
                      transform: `translate3d(0, ${LANE.floorY}px, ${-d}px) rotateX(90deg)`,
                      opacity: `calc((${d} - 240 - var(--camN, 0)) / 380 * var(--lightsOn, 0) * 0.9)`,
                    } as React.CSSProperties
                  }
                />
              </Fragment>
            ))}

            {/* Distance markings across the lane floor. */}
            {MARKERS.map((d) => (
              <div
                key={`mk-${d}`}
                className={styles.marker}
                style={
                  {
                    transform: `translate3d(0, ${LANE.floorY - 1}px, ${-d}px) rotateX(90deg)`,
                    opacity: `calc((${d} - 260 - var(--camN, 0)) / 380 * var(--sceneOn, 0))`,
                  } as React.CSSProperties
                }
              />
            ))}

            {/* The target. It grows purely through perspective as the camera
                closes on it — its scale is never animated directly. */}
            <div className={styles.targetRig}>
              <div className={styles.hanger} />
              <div className={styles.frame}>
                <div className={styles.paper}>
                  <TargetRings
                    rings={7}
                    weight={0.9}
                    bullseye
                    className={styles.paperRings}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.haze} />
        <div className={styles.vignette} />

        {/* ---- Type ---------------------------------------------------- */}
        <div className={styles.hud}>
          <ScrollLabel className={styles.eyebrow} tone="sand" delay={0.35}>
            {T(brand.city)}
          </ScrollLabel>

          <MaskHeading
            as="h1"
            size="mega"
            lines={nameLines}
            trigger="mount"
            delay={0.5}
            stagger={0.1}
            className={styles.wordmark}
          />

          <p className={`body-copy ${styles.support}`}>{T(heroCopy.support)}</p>
        </div>

        <div className={styles.cue}>
          <span className={styles.cueLabel}>{T(ui.scrollToEnter)}</span>
          <span className={styles.cueTrack}>
            <span className={styles.cueBead} />
          </span>
        </div>

        {/* ---- The doorway --------------------------------------------- */}
        <TargetRings
          rings={9}
          weight={0.4}
          bullseye={false}
          className={styles.portalRings}
        />
        {/* The doorway opens onto the real range. The Intro section paints the
            same photograph full-bleed, so when the portal finishes there is no
            cut at all — the visitor has walked through the bullseye into the
            actual place. */}
        <div className={styles.portal}>
          <Photo name="range" alt="" grade="heavy" priority position="center 42%" />
        </div>
      </div>
    </section>
  );
}
