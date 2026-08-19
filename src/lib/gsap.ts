"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined" && !(gsap.core as unknown as { __sq8?: boolean }).__sq8) {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  /* Tuned for touch: ScrollTrigger should not fight native momentum. */
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
  (gsap.core as unknown as { __sq8?: boolean }).__sq8 = true;
}

export { gsap, ScrollTrigger, SplitText };
