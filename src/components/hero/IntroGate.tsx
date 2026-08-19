"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { introAlreadySeen } from "./CinematicIntro";

/* The sequence is only ever needed on first view, so it is not part of the
   initial bundle the page is painted from. */
const CinematicIntro = dynamic(() => import("./CinematicIntro"), { ssr: false });

/**
 * Decides whether the opening sequence runs.
 *
 * The page renders underneath regardless, so the site is already there before
 * the overlay mounts — which is what lets the bullet hole reveal it rather
 * than cut to it. Within a session the sequence plays once; navigating back
 * later in the same session drops the visitor straight onto the page. It is
 * never permanently disabled.
 */
export default function IntroGate() {
  const [state, setState] = useState<"pending" | "playing" | "done">("pending");

  useEffect(() => {
    setState(introAlreadySeen() ? "done" : "playing");
  }, []);

  const onDone = useCallback(() => setState("done"), []);

  /* Until the decision is made the page must not scroll, or a returning
     visitor sees a frame of movement before the overlay would have appeared. */
  useEffect(() => {
    if (state !== "pending") return;
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    return () => {
      document.documentElement.style.scrollBehavior = prev;
    };
  }, [state]);

  if (state !== "playing") return null;
  return <CinematicIntro onDone={onDone} />;
}
