"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { SCRUB, prefersReducedMotion, useGsap } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { brand, hero as heroCopy, ui } from "@/data/site";
import { getOpenState, type OpenState } from "@/lib/hours";
import MaskHeading from "@/components/motion/MaskHeading";
import TargetRings from "@/components/motion/TargetRings";
import Round from "@/components/visual/Round";
import Photo from "@/components/visual/Photo";
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
/**
 * The round.
 *
 * It starts close to the camera and travels the length of the lane as you
 * scroll, so it is the thing your finger is actually moving. Its world
 * position is a pure function of the travel value — never of the live camera
 * position — so scrubbing backwards retraces exactly the same path.
 *
 * The camera chases it, which is why it holds its size for the first part of
 * the flight and only pulls away once it has the speed.
 */
const ROUND = {
  /* How hard it recedes. Higher shrinks it faster over the same travel. */
  depth: 15,
  /* How far below the vanishing point it sits at full size, in screen px.
     Negative lifts it clear of the display type underneath. */
  dropPx: -12,
  /* The travel window as a fraction of the hero timeline. */
  from: 0.04,
  to: 0.58,
};

/* Holes already in the paper when you arrive. The round you fire adds the
   one in the centre. */
const OLD_HOLES = [
  { x: 41, y: 55 },
  { x: 57, y: 43 },
];

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
      const round = { t: 0, hole: 0, flash: 0 };

      const roundEl = stage.querySelector<HTMLElement>(`.${styles.round}`);
      const holeEl = stage.querySelector<HTMLElement>(`.${styles.hole}`);
      const impact = stage.querySelector<HTMLElement>(`.${styles.impact}`);

      const hud = stage.querySelector<HTMLElement>(`.${styles.hud}`);

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
        if (roundEl) {
          const t = round.t;
          /* Hyperbolic falloff, the same shape real perspective gives:
             scale = 1 / (1 + t * depth). Everything is a pure function of the
             travel value, so scrubbing back retraces the path exactly. */
          const scale = 1 / (1 + t * ROUND.depth);
          /* Offsetting by the scaled distance is what makes it converge on
             the vanishing point instead of sliding to it in a straight line. */
          const y = ROUND.dropPx * scale;
          const spin = t * 22;
          roundEl.style.transform =
            `translate(-50%, -50%) translate(0, ${y.toFixed(1)}px) ` +
            `scale(${scale.toFixed(4)}) rotate(${spin.toFixed(2)}deg)`;
          roundEl.style.opacity = t >= 1 ? "0" : String(Math.min(1, (1 - t) * 9));
        }
        if (holeEl) holeEl.style.opacity = round.hole.toFixed(3);
        if (impact) {
          impact.style.opacity = round.flash.toFixed(3);
          impact.style.transform =
            `translate(-50%, -50%) scale(${(0.5 + round.flash * 0.9).toFixed(3)})`;
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

      /* 0.15 to 0.45 : the advance. */
      tl.to(cam, { n: 1600, duration: 0.3 }, 0.15);

      /* The type is on screen from the first frame and clears once, as the
         camera commits to the lane. Nothing arrives mid-scroll. */
      tl.to(stage.querySelector(`.${styles.cue}`), { autoAlpha: 0, y: 24, duration: 0.05 }, 0.06)
        .to(hud, { autoAlpha: 0, y: -52, scale: 0.965, duration: 0.16 }, 0.2);

      /* The round runs the length of the lane across half the hero, so it is
         moving with the finger rather than firing on a cue. It accelerates
         away once it has the speed. */
      /* Linear, and deliberately so. An eased start looks better in
         isolation but lets the camera — which accelerates down the lane —
         overtake the round, at which point it passes through the camera plane
         and blows up across the frame. A round travels at a constant speed
         anyway, and constant speed is what keeps it ahead. */
      tl.fromTo(
        round,
        { t: 0 },
        { t: 1, duration: ROUND.to - ROUND.from, ease: "none" },
        ROUND.from
      );
      tl.to(round, { hole: 1, duration: 0.015 }, ROUND.to);
      tl.to(round, { flash: 1, duration: 0.012 }, ROUND.to)
        .to(round, { flash: 0, duration: 0.06, ease: "power2.out" }, ROUND.to + 0.012);

      /* 0.45 → 1.00 : the run-in. Apparent size grows as 1 / (3500 - camN),
         so the travel is split and the last leg decelerates, keeping the
         perceived rate of approach roughly even. */
      tl.to(cam, { n: 2620, duration: 0.27 }, 0.45)
        .to(cam, { n: 3150, duration: 0.16 }, 0.72)
        .to(cam, { n: CAM_END, duration: 0.12, ease: "power2.out" }, 0.88);

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
                  {/* Already in the paper when you arrive. */}
                  {OLD_HOLES.map((h, i) => (
                    <span
                      key={`old-${i}`}
                      className={styles.oldHole}
                      style={{ left: `${h.x}%`, top: `${h.y}%` }}
                    />
                  ))}
                  {/* Yours. */}
                  <span className={styles.hole} style={{ left: "50%", top: "50%" }} />
                  <span className={styles.impact} aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The round in flight.
            It is drawn over the lane rather than inside it. An object living
            in the 3D scene can never appear larger than its own world size,
            and anything big enough to read close to the camera is taller than
            the lane itself, so the ceiling plane cuts through it. Here the
            perspective falloff is applied directly instead, and it converges
            on the vanishing point exactly as the geometry does. */}
        <div className={styles.round}>
          <Round />
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
            trigger="mount"
            delay={0.35}
            stagger={0.05}
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
        {/* The doorway opens onto exactly what the Intro section shows, so
            the two are continuous: the visitor passes through the bullseye
            into the next room rather than the hero simply ending. This is the
            one place the same photograph appears twice, and it is the whole
            point of the transition. */}
        <div className={styles.portal}>
          <div className={styles.portalInner}>
            <Photo name="range" alt="" grade="heavy" position="center 42%" />
          </div>
        </div>
      </div>
    </section>
  );
}
