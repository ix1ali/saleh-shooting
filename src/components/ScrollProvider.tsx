"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { ScrollTrigger, gsap } from "@/lib/gsap";
import { useRefreshOnFonts } from "@/lib/motion";

/**
 * Scroll smoothing.
 *
 * Deliberately NOT enabled for touch. Lenis is excellent on a trackpad, but
 * hijacking touch scrolling on a phone always costs the direct finger
 * connection this site depends on — flicks stop feeling like flicks. So the
 * phone keeps native momentum scrolling, and only pointer devices get the
 * smoothed wheel. ScrollTrigger is driven from the same ticker either way.
 */
export default function ScrollProvider() {
  useRefreshOnFonts();

  useEffect(() => {
    /* The hero is a scroll-driven sequence, so a browser-restored scroll
       position drops the visitor into an arbitrary frame of it on reload. */
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) return;

    const lenis = new Lenis({
      duration: 0.9,
      easing: (x: number) => 1 - Math.pow(1 - x, 3),
      /* Native touch is preserved even if this ever runs on a hybrid device. */
      syncTouch: false,
      touchMultiplier: 1.6,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    /* iOS reports a new viewport height when the address bar collapses. Only
       remeasure on a real width change, otherwise every scroll direction
       change would rebuild every trigger. */
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return null;
}
