"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "./gsap";

/* -------------------------------------------------------------------------
   Motion tokens — one vocabulary shared by every section so the whole site
   moves with the same hand, even though each section has its own idea.
   ---------------------------------------------------------------------- */

export const EASE = {
  /** Quick settle, no overshoot. Default for entrances. */
  enter: "power3.out",
  /** Slightly firmer entrance for smaller elements. */
  crisp: "power3.out",
  /** Symmetrical, for state changes and exits. */
  inOut: "power2.inOut",
  /** For elements leaving the frame. */
  exit: "power2.in",
} as const;

/* Short by design. Long tails on every reveal read as sluggish once there are
   dozens of them on a page — the motion should be over before it is noticed. */
export const DUR = {
  micro: 0.22,
  fast: 0.34,
  base: 0.5,
  slow: 0.62,
} as const;

/** Scrub values. Small numbers keep scrubbed motion locked to the finger. */
export const SCRUB = {
  tight: 0.35,
  soft: 0.7,
} as const;

/** Standard "enter the viewport" trigger position for mobile. */
export const START = "top 82%";

/**
 * The shared reveal trigger.
 *
 * Reveals run in both directions: content animates in as it enters the frame
 * and back out as it leaves, in either scroll direction. `once: true` would be
 * cheaper, but it leaves the page feeling like a list of things that have
 * already happened once you scroll back up through it.
 *
 * toggleActions maps to onEnter / onLeave / onEnterBack / onLeaveBack.
 */
export const REVEAL = {
  /* Wide enough that text is only animating at the very edges of the frame.
     A narrower window makes copy vanish while it is still being read. */
  start: "top 94%",
  end: "bottom 6%",
  toggleActions: "play reverse play reverse",
} as const;

export const isBrowser = typeof window !== "undefined";

export function prefersReducedMotion(): boolean {
  if (!isBrowser) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const useIsoLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

/* -------------------------------------------------------------------------
   useGsap — scoped gsap.context with guaranteed cleanup. Every ScrollTrigger
   created inside is reverted on unmount, so nothing leaks between locales.
   ---------------------------------------------------------------------- */

type GsapSetup = (ctx: gsap.Context) => void;

export function useGsap(
  setup: GsapSetup,
  deps: React.DependencyList = [],
  scope?: React.RefObject<HTMLElement | null>
) {
  useIsoLayoutEffect(() => {
    const el = scope?.current ?? undefined;
    if (scope && !el) return;
    const ctx = gsap.context(setup, el);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* -------------------------------------------------------------------------
   Reduced motion: sections call this to decide between a scrubbed cinematic
   timeline and a short, tasteful fade. Layout never changes either way.
   ---------------------------------------------------------------------- */

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/* -------------------------------------------------------------------------
   Parallax — moves an element against scroll at a fraction of page speed.
   Uses yPercent so it never triggers layout.
   ---------------------------------------------------------------------- */

export function useParallax(
  ref: React.RefObject<HTMLElement | null>,
  strength = 12,
  trigger?: React.RefObject<HTMLElement | null>
) {
  useGsap(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    gsap.fromTo(
      el,
      { yPercent: -strength },
      {
        yPercent: strength,
        ease: "none",
        scrollTrigger: {
          trigger: trigger?.current ?? el,
          start: "top bottom",
          end: "bottom top",
          scrub: SCRUB.tight,
        },
      }
    );
  }, [strength]);
}

/* -------------------------------------------------------------------------
   useScrollProgress — writes raw 0..1 progress of an element through the
   viewport into a CSS custom property. Lets CSS do the work for cheap,
   continuous effects without a React re-render.
   ---------------------------------------------------------------------- */

export function useScrollProgress(
  ref: React.RefObject<HTMLElement | null>,
  varName = "--p",
  start = "top bottom",
  end = "bottom top"
) {
  useGsap(() => {
    const el = ref.current;
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start,
      end,
      onUpdate: (self) => el.style.setProperty(varName, self.progress.toFixed(4)),
    });
  }, [varName, start, end]);
}

/* -------------------------------------------------------------------------
   Refresh ScrollTrigger once webfonts are in, otherwise every measurement
   taken during the fallback-font paint is wrong.
   ---------------------------------------------------------------------- */

export function useRefreshOnFonts() {
  useEffect(() => {
    let done = false;
    const refresh = () => {
      if (done) return;
      done = true;
      ScrollTrigger.refresh();
    };
    if (document.fonts?.status === "loaded") {
      requestAnimationFrame(refresh);
    } else {
      document.fonts?.ready.then(() => requestAnimationFrame(refresh));
      setTimeout(refresh, 2500);
    }
  }, []);
}

/** True once the element has ever been within `margin` of the viewport. */
export function useNearViewport(margin = "300px") {
  const ref = useRef<HTMLDivElement | null>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: margin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin, near]);
  return { ref, near };
}
