"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion, useIsoLayoutEffect } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { intro as introCopy, ui } from "@/data/site";
import TargetRings from "@/components/motion/TargetRings";
import styles from "./CinematicIntro.module.css";

/* -------------------------------------------------------------------------
   Lane geometry, in CSS-3D units. Perspective is 300, so an object at depth
   z appears at scale 300 / (300 - z).
   ---------------------------------------------------------------------- */

const LANE = {
  width: 320,
  height: 232,
  length: 4600,
  floorY: 118,
  ceilY: -114,
  targetZ: -3400,
  backZ: -3640,
  /* The long planes are pushed back so they still fill the frame at the far
     end of the run. Centred on zero they end up entirely behind the camera by
     the time it reaches the target, leaving it floating in black. */
  shift: -1750,
};

/** Where the camera finishes: past the target plane, so the paper fills the
    frame. Under CSS perspective an object cannot exceed its own world size at
    z <= 0, so stopping at the target tops out near half the screen. */
const CAM_END = 3600;

const DIVIDERS = [340, 700, 1060, 1420, 1780, 2140, 2500, 2860, 3220];
const LIGHTS = [260, 640, 1020, 1400, 1780, 2160, 2540, 2920, 3300, 3680];
const MARKERS = [900, 1800, 2700];
const OLD_HOLES = [
  { x: 41, y: 55 },
  { x: 57, y: 43 },
];

const SEEN_KEY = "sq8:intro-seen";

type Props = { onDone: () => void };

/**
 * The opening sequence.
 *
 * A fixed layer over the page. The site is already mounted underneath, so the
 * bullet hole is not an illustration of the site: punching the mask through
 * this layer reveals the real first section behind it, which is what makes
 * the camera appear to pass through the paper into the page.
 *
 * The whole thing is one GSAP timeline. Phases are positions on it, not
 * separate animations, so nothing can drift out of sync.
 */
export default function CinematicIntro({ onDone }: Props) {
  const overlay = useRef<HTMLDivElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const shootBtn = useRef<HTMLButtonElement | null>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const [ready, setReady] = useState(false);
  const [firing, setFiring] = useState(false);
  const { T } = useLocale();

  /* ---- Arm the control once fonts and the first frame are settled ------- */
  useEffect(() => {
    let cancelled = false;
    const arm = () => {
      if (!cancelled) setReady(true);
    };
    const fonts = document.fonts?.ready ?? Promise.resolve();
    Promise.resolve(fonts).then(() => requestAnimationFrame(arm));
    const cap = window.setTimeout(arm, 1400);
    return () => {
      cancelled = true;
      window.clearTimeout(cap);
    };
  }, []);

  /* ---- The page must not move underneath the overlay -------------------- */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* ---- Finish: hand the screen to the page ----------------------------- */
  const finish = useCallback(() => {
    try {
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* Private mode. The intro simply plays again. */
    }
    document.body.style.overflow = "";
    ScrollTrigger.refresh();
    onDone();
  }, [onDone]);

  const skip = useCallback(() => {
    tl.current?.kill();
    finish();
  }, [finish]);

  /* ---- The sequence ----------------------------------------------------- */

  const fire = useCallback(() => {
    if (firing || !ready) return;
    setFiring(true);

    const root = overlay.current;
    const st = stage.current;
    if (!root || !st) return finish();

    const set = (k: string, v: string | number) => root.style.setProperty(k, String(v));
    const q = <T extends Element>(sel: string) => root.querySelector<T>(sel);

    const reduced = prefersReducedMotion();

    /* Reduced motion: the trigger, a strike, and through. No chase. */
    if (reduced) {
      const t = gsap.timeline({ onComplete: finish });
      t.to(q(`.${styles.controls}`), { autoAlpha: 0, duration: 0.2 })
        .to(q(`.${styles.muzzle}`), { autoAlpha: 1, duration: 0.06 }, 0)
        .to(q(`.${styles.muzzle}`), { autoAlpha: 0, duration: 0.16 }, 0.06)
        .to(root, { "--holeR": "160%", duration: 0.7, ease: "power2.inOut" }, 0.2)
        .to(root, { autoAlpha: 0, duration: 0.25 }, 0.75);
      tl.current = t;
      return;
    }

    const cam = { z: 0 };
    const applyCam = () => set("--camZ", cam.z.toFixed(1));

    const t = gsap.timeline({
      defaults: { ease: "none" },
      onUpdate: applyCam,
      onComplete: finish,
    });
    tl.current = t;

    const controls = q(`.${styles.controls}`);
    const muzzle = q(`.${styles.muzzle}`);
    const surface = q(`.${styles.surfaceFlash}`);
    const round = q(`.${styles.round}`);
    const trail = q(`.${styles.roundTrail}`);
    const streak = q(`.${styles.streak}`);
    const dof = q(`.${styles.dof}`);
    const paper = q(`.${styles.paper}`);
    const tear = q(`.${styles.tear}`);
    const through = q(`.${styles.throughFlash}`);

    /* -- Phase 1 · trigger (0 → 0.28) ----------------------------------- */
    t.to(controls, { autoAlpha: 0, y: 18, duration: 0.18, ease: "power2.in" }, 0);

    /* Muzzle flash: a few frames, no more. */
    t.set(muzzle, { autoAlpha: 1 }, 0.06)
      .to(muzzle, { autoAlpha: 0, duration: 0.13, ease: "power2.out" }, 0.09);
    t.set(surface, { autoAlpha: 0.9 }, 0.06)
      .to(surface, { autoAlpha: 0, duration: 0.22, ease: "power2.out" }, 0.09);

    /* Recoil: the camera is kicked back, then recovers onto the lane. */
    t.fromTo(
      st,
      { y: 0, scale: 1 },
      { y: 16, scale: 0.995, duration: 0.07, ease: "power3.out" },
      0.06
    ).to(st, { y: 0, scale: 1, duration: 0.42, ease: "elastic.out(1, 0.55)" }, 0.13);

    /* -- Phase 2 · the camera catches the round (0.18 → 0.55) ----------- */
    t.set(round, { autoAlpha: 1 }, 0.16)
      .fromTo(round, { scale: 2.6, y: 120 }, { scale: 1, y: 0, duration: 0.34, ease: "power2.out" }, 0.16);
    t.fromTo(trail, { autoAlpha: 0, scaleY: 0.2 }, { autoAlpha: 0.9, scaleY: 1, duration: 0.3 }, 0.2);

    /* -- Phase 3 · range travel (0.2 → 2.35) ---------------------------- */
    /* Two legs: the acceleration off the line, then the long run. Apparent
       speed comes from the geometry passing, not from added speed lines. */
    t.to(cam, { z: 900, duration: 0.55, ease: "power2.in" }, 0.2)
      .to(cam, { z: 2750, duration: 1.25, ease: "none" }, 0.75);

    /* Velocity cues ride the same window and never exceed a whisper. */
    t.to(streak, { autoAlpha: 0.85, duration: 0.5 }, 0.3)
      .to(dof, { autoAlpha: 1, duration: 0.5 }, 0.35);
    t.fromTo(streak, { scale: 1 }, { scale: 1.5, duration: 1.7, ease: "none" }, 0.3);

    /* A little vibration through the fast leg only. */
    t.to(st, { x: 1.6, duration: 0.05, repeat: 22, yoyo: true, ease: "none" }, 0.75)
      .set(st, { x: 0 }, 1.95);

    /* -- Phase 4 · target approach (2.0 → 2.95) -------------------------- */
    t.to(cam, { z: 3380, duration: 0.6, ease: "power1.out" }, 2.0);
    t.to(streak, { autoAlpha: 0, duration: 0.4 }, 2.35)
      .to(dof, { autoAlpha: 0.35, duration: 0.4 }, 2.35);
    t.to(trail, { autoAlpha: 0, duration: 0.3 }, 2.4);

    /* The slight hold before the strike. Roughly 200ms of eased-down time. */
    t.to(cam, { z: CAM_END, duration: 0.42, ease: "power3.out" }, 2.6);

    /* -- Phase 5 · impact, then through --------------------------------- */
    /* The sheet buckles, the strike opens, and the mask takes over from the
       drawn tear so the hole becomes a real opening in this layer. */
    t.to(round, { autoAlpha: 0, duration: 0.05 }, 2.98);
    t.set(tear, { autoAlpha: 1 }, 2.98)
      .fromTo(paper, { "--paperPunch": 1 }, { "--paperPunch": 1.035, duration: 0.07, ease: "power3.out" }, 2.98)
      .to(paper, { "--paperPunch": 1, duration: 0.3, ease: "elastic.out(1, 0.5)" }, 3.05);
    t.fromTo(tear, { "--tear": 0 }, { "--tear": 3.4, duration: 0.34, ease: "power2.in" }, 2.98);

    t.set(through, { autoAlpha: 0.55 }, 3.0)
      .to(through, { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, 3.06);

    /* The camera continues through the opening as the hole becomes the mask. */
    t.to(cam, { z: CAM_END + 340, duration: 0.62, ease: "power2.in" }, 3.0);
    t.fromTo(
      root,
      { "--holeR": "0%" },
      { "--holeR": "165%", duration: 0.72, ease: "power2.in" },
      3.08
    );
    t.to(root, { autoAlpha: 0, duration: 0.18 }, 3.68);
  }, [firing, ready, finish]);

  /* ---- The control drifts toward the pointer, then settles -------------- */
  useIsoLayoutEffect(() => {
    const btn = shootBtn.current;
    if (!btn || prefersReducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      const pull = Math.max(0, 1 - dist / 260);
      btn.style.setProperty("--px", `${(dx * 0.16 * pull).toFixed(2)}px`);
      btn.style.setProperty("--py", `${(dy * 0.16 * pull).toFixed(2)}px`);
      btn.style.setProperty("--ps", (1 + pull * 0.045).toFixed(3));
    };
    const reset = () => {
      btn.style.setProperty("--px", "0px");
      btn.style.setProperty("--py", "0px");
      btn.style.setProperty("--ps", "1");
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", reset);
    };
  }, []);

  /* Space or Enter fires, Escape skips. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip]);

  const ringLen = 2 * Math.PI * 53;

  return (
    <div
      ref={overlay}
      className={styles.overlay}
      role="dialog"
      aria-label={T(introCopy.label)}
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
      <div ref={stage} className={styles.stage}>
        <div className={styles.camera}>
          <div className={`${styles.plane} ${styles.floor}`} />
          <div className={`${styles.plane} ${styles.ceiling}`} />
          <div className={`${styles.plane} ${styles.wall} ${styles.wallL}`} />
          <div className={`${styles.plane} ${styles.wall} ${styles.wallR}`} />
          <div className={`${styles.plane} ${styles.backwall}`} />

          {/* Booth dividers. Each fades out just before the camera would pass
              through it, so nothing straddles the camera plane and blows up
              across the frame. The expression is pure CSS — no per-element
              JavaScript runs per frame. */}
          {DIVIDERS.map((d) =>
            [-1, 1].map((side) => (
              <div
                key={`d${d}-${side}`}
                className={styles.divider}
                style={
                  {
                    transform: `translate3d(${side * (LANE.width / 2 - 18)}px, 0, ${-d}px)`,
                    opacity: `calc((${d} - 300 - var(--camZ, 0)) / 420)`,
                  } as React.CSSProperties
                }
              >
                <span className={styles.dividerEdge} style={side === -1 ? { right: 0 } : { left: 0 }} />
              </div>
            ))
          )}

          {/* A Fragment, never a wrapper: an element without preserve-3d would
              flatten these back into one plane and collapse the depth. */}
          {LIGHTS.map((d) => (
            <Fragment key={`l${d}`}>
              <div
                className={styles.light}
                style={
                  {
                    transform: `translate3d(0, ${LANE.ceilY + 6}px, ${-d}px)`,
                    opacity: `calc((${d} - 240 - var(--camZ, 0)) / 380)`,
                  } as React.CSSProperties
                }
              />
              <div
                className={styles.pool}
                style={
                  {
                    transform: `translate3d(0, ${LANE.floorY}px, ${-d}px) rotateX(90deg)`,
                    opacity: `calc((${d} - 240 - var(--camZ, 0)) / 380 * 0.9)`,
                  } as React.CSSProperties
                }
              />
            </Fragment>
          ))}

          {MARKERS.map((d) => (
            <div
              key={`m${d}`}
              className={styles.marker}
              style={
                {
                  transform: `translate3d(0, ${LANE.floorY - 1}px, ${-d}px) rotateX(90deg)`,
                  opacity: `calc((${d} - 260 - var(--camZ, 0)) / 380)`,
                } as React.CSSProperties
              }
            />
          ))}

          {/* The target. It grows purely through perspective as the camera
              closes on it — its scale is never animated. */}
          <div className={styles.targetRig}>
            <div className={styles.hanger} />
            <div className={styles.frame}>
              <div className={styles.paper}>
                <TargetRings rings={7} weight={1.1} bullseye fade={false} tone="ink" className={styles.paperRings} />
                {OLD_HOLES.map((h, i) => (
                  <span key={i} className={styles.oldHole} style={{ left: `${h.x}%`, top: `${h.y}%` }} />
                ))}
                <span className={styles.tear} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screen-space layers. They sit outside the 3D container on purpose:
          inside a preserve-3d parent they take part in the same space, and the
          floor and walls — which extend toward the camera — render in front of
          them, which hid the control entirely. */}
      <div className={styles.roundTrail} />
      <div className={styles.round} />
      <div className={styles.streak} />
      <div className={styles.dof} />
      <div className={styles.muzzle} />
      <div className={styles.surfaceFlash} />
      <div className={styles.vignette} />
      <div className={styles.grain} />
      <div className={styles.throughFlash} />

        {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-mark.png" alt="" className={styles.mark} width={26} height={26} />

      <div className={styles.controls}>
        <button
          ref={shootBtn}
            type="button"
            className={styles.shoot}
            data-ready={ready && !firing}
            onClick={fire}
            aria-label={T(ui.shoot)}
          >
            <span className={styles.shootRing} aria-hidden="true" />
            <svg className={styles.shootProgress} viewBox="0 0 108 108" aria-hidden="true">
              <circle
                cx="54"
                cy="54"
                r="53"
                strokeDasharray={ringLen}
                strokeDashoffset={ready ? 0 : ringLen}
              />
            </svg>
            <span className={styles.shootPulse} aria-hidden="true" />
            <span className={styles.shootFace} aria-hidden="true" />
            <span className={styles.shootLabel}>{T(ui.shoot)}</span>
          </button>
        </div>

      <button type="button" className={styles.skip} onClick={skip}>
        {T(ui.skip)}
      </button>
    </div>
  );
}

/** Whether the sequence has already played this session. */
export function introAlreadySeen(): boolean {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}
