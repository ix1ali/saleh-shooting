"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { SCRUB, prefersReducedMotion, useGsap } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { brand, hero as heroCopy, ui } from "@/data/site";
import { getOpenState, type OpenState } from "@/lib/hours";
import MaskHeading from "@/components/motion/MaskHeading";
import TargetRings from "@/components/motion/TargetRings";
import Sidearm from "@/components/visual/Sidearm";
import styles from "./RangeHero.module.css";

/* -------------------------------------------------------------------------
   Lane geometry, in CSS-3D units. Perspective is 300, so an object at depth
   d appears at scale 300 / (300 - z), where z is its position after the
   camera translate.
   ---------------------------------------------------------------------- */

const LANE = {
  width: 320,
  height: 232,
  length: 4200,
  floorY: 118,
  ceilY: -114,
  targetZ: -3200,
  backZ: -3420,
  /* The long planes are pushed back so they still fill the frame at the far
     end of the run-in. Centred on zero they end up entirely behind the camera
     by the time it reaches the target, leaving it floating in black. */
  shift: -1600,
};

/**
 * How far the camera travels.
 *
 * It passes the target plane and finishes 200 units in front of it, where the
 * 190-unit target finally exceeds the width of the phone. Stopping at the
 * target plane tops out near half the screen, which is not a takeover.
 */
const CAM_END = 3400;

const DIVIDERS = [420, 780, 1140, 1500, 1860, 2220, 2580, 2940, 3300];
const LIGHTS = [300, 700, 1100, 1500, 1900, 2300, 2700, 3100, 3500];
const MARKERS = [900, 1800, 2700];

/**
 * The three shots.
 *
 * `at` is the position in the hero timeline where the round leaves the muzzle,
 * `hole` is where it lands on the paper as a fraction of the target face.
 * Each round starts just in front of the camera wherever the camera happens to
 * be, so it always reads as being fired from where the visitor is standing.
 */
const SHOTS = [
  { at: 0.05, dur: 0.075, hole: { x: 47.5, y: 47 } },
  { at: 0.3, dur: 0.055, hole: { x: 52, y: 51.5 } },
  { at: 0.46, dur: 0.05, hole: { x: 46.5, y: 52.5 } },
];

/**
 * Where a round starts, relative to the lane centre, in 3D units.
 *
 * The muzzle sits low and right of frame, so a round leaves from there and
 * converges on the target as it travels. Perspective does most of that
 * convergence by itself; the rest is interpolated so every round lands on the
 * bullseye rather than near it.
 */
const MUZZLE = { x: 78, y: 66 };

const INITIAL: OpenState = { open: null, today: null, boundary: null, now: null };

export default function RangeHero() {
  const root = useRef<HTMLElement | null>(null);
  const sticky = useRef<HTMLDivElement | null>(null);
  const { T, version } = useLocale();
  const [state, setState] = useState<OpenState>(INITIAL);

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

      /* Reduced motion: the lane sits lit at a mid depth and holds still. */
      if (prefersReducedMotion()) {
        set("--camN", 1500);
        set("--sceneOn", 1);
        set("--lightsOn", 1);
        set("--portalR", "0%");
        return;
      }

      const cam = { n: 0, scene: 0.7, lights: 0.6, portal: 0, rings: 0, ringScale: 0.05 };
      /* One travel value and one hole value per shot. */
      const shot = SHOTS.map(() => ({ t: 0, hole: 0, flash: 0 }));
      const gunFlash = { v: 0 };

      const tracers = SHOTS.map((_, i) =>
        stage.querySelector<HTMLElement>(`[data-tracer="${i}"]`)
      );
      const holes = SHOTS.map((_, i) => stage.querySelector<HTMLElement>(`[data-hole="${i}"]`));
      const impact = stage.querySelector<HTMLElement>(`.${styles.impact}`);
      const gun = stage.querySelector<HTMLElement>(`.${styles.gunWrap}`);
      const muzzleFlash = stage.querySelector<HTMLElement>(`.${styles.muzzle}`);
      const fireGlow = stage.querySelector<HTMLElement>(`.${styles.fireGlow}`);

      /* The wordmark starts hidden. The shot is what puts it on screen. */
      const hud = stage.querySelector<HTMLElement>(`.${styles.hud}`);
      const hudLines = stage.querySelectorAll<HTMLElement>(
        `.${styles.wordmark} [data-line]`
      );
      const hudRest = [
        stage.querySelector(`.${styles.eyebrow}`),
        stage.querySelector(`.${styles.support}`),
        stage.querySelector(`.${styles.facts}`),
      ].filter(Boolean) as HTMLElement[];
      gsap.set(hud, { autoAlpha: 0 });
      gsap.set(hudLines, { yPercent: 112 });
      gsap.set(hudRest, { autoAlpha: 0 });

      const apply = () => {
        set("--camN", cam.n.toFixed(1));
        set("--sceneOn", cam.scene.toFixed(3));
        set("--lightsOn", cam.lights.toFixed(3));
        set("--portalR", `${(cam.portal * 155).toFixed(2)}%`);
        set("--ringsOpacity", cam.rings.toFixed(3));
        set("--ringsScale", cam.ringScale.toFixed(3));

        /* Each round flies from just ahead of the camera to the target face.
           Recomputing the start from the live camera position is what keeps
           it leaving from the shooter rather than from a fixed point. */
        const startZ = -(cam.n + 100);
        let flash = 0;
        shot.forEach((sh, i) => {
          const el = tracers[i];
          if (el) {
            if (sh.t > 0 && sh.t < 1) {
              const z = startZ + (LANE.targetZ + 12 - startZ) * sh.t;
              /* Converge on the lane centre as the round travels, so it
                 leaves the muzzle and lands on the bullseye. */
              const lat = (1 - sh.t) * (1 - sh.t);
              const x = MUZZLE.x * lat;
              const y = MUZZLE.y * lat;
              el.style.transform =
                `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px)`;
              el.style.opacity = String(Math.min(1, (1 - sh.t) * 3));
            } else {
              el.style.opacity = "0";
            }
          }
          const h = holes[i];
          if (h) h.style.opacity = sh.hole.toFixed(3);
          flash = Math.max(flash, sh.flash);
        });
        if (muzzleFlash) {
          muzzleFlash.style.opacity = gunFlash.v.toFixed(3);
          muzzleFlash.style.transform =
            `translate(-50%, -50%) scale(${(0.55 + gunFlash.v * 0.8).toFixed(3)})`;
        }
        if (fireGlow) fireGlow.style.opacity = (gunFlash.v * 0.9).toFixed(3);
        if (impact) {
          impact.style.opacity = flash.toFixed(3);
          impact.style.transform = `translate(-50%, -50%) scale(${(0.5 + flash * 0.9).toFixed(3)})`;
        }
      };
      apply();

      /* Published from the timeline, never the trigger: a scrubbed trigger
         fires on scroll while the playhead catches up on later ticks, which
         publishes stale values and freezes the scene once scrolling stops. */
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

      /* 0.00 → 0.15 : the room comes up, the camera only creeps. */
      tl.to(cam, { scene: 1, duration: 0.08 }, 0)
        .to(cam, { lights: 1, duration: 0.14, ease: "power2.inOut" }, 0.01)
        .to(cam, { n: 190, duration: 0.15 }, 0);

      /* The shot. The pistol settles into frame, fires, kicks, and is lowered
         again once the round is away. */
      if (gun) {
        /* Held on target from the very first frame: the opening image is a
           shooter on the line, not an empty corridor. */
        gsap.set(gun, { yPercent: 0, autoAlpha: 1, rotate: 0 });
        tl.to(gun, { yPercent: -13, rotate: -8, duration: 0.016, ease: "power2.out" }, 0.05)
          .to(gun, { yPercent: 0, rotate: 0, duration: 0.08, ease: "elastic.out(1, 0.5)" }, 0.066)
          .to(gun, { yPercent: 46, autoAlpha: 0, duration: 0.07, ease: "power2.in" }, 0.18);
      }

      tl.to(gunFlash, { v: 1, duration: 0.008 }, 0.05)
        .to(gunFlash, { v: 0, duration: 0.05, ease: "power2.out" }, 0.058);

      /* 0.15 to 0.45 : the advance. */
      tl.to(cam, { n: 1600, duration: 0.3 }, 0.15);

      /* The wordmark is put on screen by the shot, once the round has landed. */
      tl.to(hud, { autoAlpha: 1, duration: 0.05 }, 0.14)
        .to(hudLines, { yPercent: 0, duration: 0.085, ease: "expo.out", stagger: 0.02 }, 0.145)
        .to(hudRest, { autoAlpha: 1, duration: 0.06, stagger: 0.015, ease: "power3.out" }, 0.175);

      /* And clears again as the camera commits to the lane. */
      tl.to(stage.querySelector(`.${styles.cue}`), { autoAlpha: 0, y: 24, duration: 0.05 }, 0.1)
        .to(hud, { autoAlpha: 0, y: -52, scale: 0.965, duration: 0.14 }, 0.36);

      /* 0.45 → 1.00 : the run-in. Apparent size grows as 1 / (3500 - camN),
         so the travel is split and the last leg decelerates, keeping the
         perceived rate of approach roughly even. */
      tl.to(cam, { n: 2620, duration: 0.27 }, 0.45)
        .to(cam, { n: 3150, duration: 0.16 }, 0.72)
        .to(cam, { n: CAM_END, duration: 0.12, ease: "power2.out" }, 0.88);

      /* Three rounds go downrange while the camera is closing. The paper
         keeps every hole, so the target carries a group by the time it fills
         the frame. */
      SHOTS.forEach((cfg, i) => {
        tl.fromTo(shot[i], { t: 0 }, { t: 1, duration: cfg.dur, ease: "power1.in" }, cfg.at);
        tl.to(shot[i], { hole: 1, duration: 0.012 }, cfg.at + cfg.dur);
        tl.to(shot[i], { flash: 1, duration: 0.01 }, cfg.at + cfg.dur);
        tl.to(shot[i], { flash: 0, duration: 0.05, ease: "power2.out" }, cfg.at + cfg.dur + 0.01);
      });

      /* The bullseye becomes the doorway. */
      tl.to(cam, { portal: 1, duration: 0.16, ease: "power2.in" }, 0.84)
        .to(cam, { ringScale: 1.9, duration: 0.24 }, 0.76)
        .to(cam, { rings: 0.55, duration: 0.09 }, 0.76)
        .to(cam, { rings: 0, duration: 0.11 }, 0.87);
    },
    [version]
  );

  const nameLines = T(brand.name).split(" ");
  const openLabel =
    state.open === null ? null : state.open ? T(ui.openNow) : T(ui.closedNow);

  return (
    <section id="hero" ref={root} className={styles.hero} data-section="hero">
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
            "--laneShift": `${LANE.shift}px`,
          } as React.CSSProperties
        }
      >
        <div className={styles.world}>
          <div className={styles.camera}>
            <div className={`${styles.plane} ${styles.floor}`} />
            <div className={`${styles.plane} ${styles.ceiling}`} />
            <div className={`${styles.plane} ${styles.wall} ${styles.wallL}`} />
            <div className={`${styles.plane} ${styles.wall} ${styles.wallR}`} />
            <div className={`${styles.plane} ${styles.backwall}`} />

            {/* Booth dividers down both walls. Each fades out just before the
                camera would pass through it, so nothing ever straddles the
                camera plane and explodes across the frame. The expression is
                pure CSS, so no per-element JavaScript runs per frame. */}
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
                >
                  <span
                    className={styles.dividerEdge}
                    style={side === -1 ? { right: 0 } : { left: 0 }}
                  />
                </div>
              ))
            )}

            {/* A Fragment, never a wrapper div: an element without
                transform-style: preserve-3d flattens these into one plane. */}
            {LIGHTS.map((d) => (
              <Fragment key={`lt-${d}`}>
                <div
                  className={styles.light}
                  style={
                    {
                      transform: `translate3d(0, ${LANE.ceilY + 6}px, ${-d}px)`,
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

            {/* Rounds in flight. They sit in the camera space, so the
                perspective shrinks them as they travel rather than the size
                being animated. */}
            {SHOTS.map((_, i) => (
              <div key={`tracer-${i}`} data-tracer={i} className={styles.tracer} />
            ))}

            {/* The target grows purely through perspective as the camera
                closes on it. Its scale is never animated directly. */}
            <div className={styles.targetRig}>
              <div className={styles.hanger} />
              <div className={styles.frame}>
                <div className={styles.paper}>
                  <TargetRings
                    rings={7}
                    weight={1.1}
                    bullseye
                    fade={false}
                    tone="ink"
                    className={styles.paperRings}
                  />
                  {SHOTS.map((cfg, i) => (
                    <span
                      key={`hole-${i}`}
                      data-hole={i}
                      className={styles.hole}
                      style={{ left: `${cfg.hole.x}%`, top: `${cfg.hole.y}%` }}
                    />
                  ))}
                  <span className={styles.impact} aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.fireGlow} aria-hidden="true" />

        <div className={styles.gunWrap}>
          <Sidearm />
          <span className={styles.muzzle} aria-hidden="true" />
        </div>

        <div className={styles.haze} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.grain} aria-hidden="true" />

        {/* ---- Type ---------------------------------------------------- */}
        <div className={styles.hud}>
          {/* Driven by the hero timeline rather than ScrollLabel, which
              carries its own scroll trigger and would fight it: inside a
              sticky section that trigger never leaves the frame, so the two
              ended up in opposite states. */}
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowRule} aria-hidden="true" />
            <span className={`label ${styles.eyebrowText}`}>{T(brand.city)}</span>
          </span>

          <MaskHeading
            as="h1"
            size="mega"
            lines={nameLines}
            trigger="none"
            className={styles.wordmark}
          />

          <p className={`body-copy ${styles.support}`}>{T(heroCopy.support)}</p>

          <div className={styles.facts}>
            <span className={styles.fact} data-open={state.open === true}>
              <span className={styles.factDot} aria-hidden="true" />
              {openLabel ?? T(ui.today)}
            </span>
            <span className={styles.fact}>{T(heroCopy.factRanges)}</span>
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
          <div className={styles.portalInner} />
        </div>
      </div>
    </section>
  );
}
