"use client";

import { useCallback, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SCRUB, prefersReducedMotion, useGsap } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { activities, activitiesSection, contact, type Activity } from "@/data/site";
import MaskHeading from "@/components/motion/MaskHeading";
import ScrollLabel from "@/components/motion/ScrollLabel";
import RevealCopy from "@/components/motion/RevealCopy";
import Photo from "@/components/visual/Photo";
import styles from "./ActivitiesGrid.module.css";

/**
 * Section 04. A scannable index of everything on site.
 *
 * The point of the section is navigation, so it has to read fast — but each
 * card still arrives with the motion of its own discipline rather than a
 * shared fade, which is what stops a grid from feeling like card soup.
 */
export default function ActivitiesGrid() {
  const root = useRef<HTMLElement | null>(null);
  const { T, version } = useLocale();

  useGsap(
    () => {
      const el = root.current;
      if (!el) return;
      const cards = gsap.utils.toArray<HTMLElement>(`.${styles.card}`, el);
      const reduced = prefersReducedMotion();

      cards.forEach((card, i) => {
        const motion = card.dataset.motion as Activity["motion"];
        const media = card.querySelector(`.${styles.media}`);
        const pulse = card.querySelector(`.${styles.pulse}`);
        const title = card.querySelector(`.${styles.title}`);
        const arrow = card.querySelector(`.${styles.arrow}`);
        const flare = card.querySelector(`.${styles.flare}`);

        if (reduced) {
          gsap.fromTo(
            card,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.3, scrollTrigger: { trigger: card, start: "top 90%", once: true } }
          );
          return;
        }

        /* Entrance: shared grammar, per-card inflection. */
        const tl = gsap.timeline({
          scrollTrigger: { trigger: card, start: "top 88%", once: true },
          delay: (i % 2) * 0.06,
        });

        if (motion === "recoil") {
          /* Kicks back and settles, the way a shot moves the shoulder. */
          tl.fromTo(
            card,
            { yPercent: 16, autoAlpha: 0, scale: 0.96 },
            { yPercent: 0, autoAlpha: 1, scale: 1, duration: 0.5, ease: "power3.out" }
          )
            .to(card, { y: -7, duration: 0.09, ease: "power2.out" }, 0.42)
            .to(card, { y: 0, duration: 0.7, ease: "elastic.out(1, 0.55)" }, 0.51);
          if (flare) {
            tl.fromTo(flare, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1.1, duration: 0.09 }, 0.42)
              .to(flare, { autoAlpha: 0, duration: 0.34 }, 0.51);
          }
        } else if (motion === "arrow") {
          tl.fromTo(
            card,
            { yPercent: 16, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: "expo.out" }
          );
          if (arrow) {
            /* The arrow crosses the frame once, then is gone. */
            tl.fromTo(
              arrow,
              { xPercent: -40, autoAlpha: 0 },
              { xPercent: 40, autoAlpha: 1, duration: 0.42, ease: "power2.in" },
              0.3
            ).to(arrow, { xPercent: 340, autoAlpha: 0, duration: 0.5, ease: "power2.out" }, 0.72);
          }
        } else {
          tl.fromTo(
            card,
            { yPercent: 18, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 0.85, ease: "expo.out" }
          );
        }

        /* The shot mark: a ring opening out of the centre of the card. */
        if (pulse) {
          tl.fromTo(
            pulse,
            { scale: 0.2, autoAlpha: 0.85 },
            { scale: 2.4, autoAlpha: 0, duration: 1.1, ease: "power2.out" },
            0.28
          );
        }

        if (title) {
          tl.fromTo(
            title,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.7, ease: "expo.out" },
            0.16
          );
        }

        /* The picture keeps moving against its frame for the whole pass. */
        if (media) {
          const dir = motion === "push" ? 1 : -1;
          gsap.fromTo(
            media,
            { yPercent: 5 * dir, scale: 1.08 },
            {
              yPercent: -5 * dir,
              scale: 1,
              ease: "none",
              scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: SCRUB.tight },
            }
          );
        }
      });
    },
    [version]
  );

  /* In-page targets scroll; everything else opens the DM. */
  const onCard = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  return (
    <section id="activities" ref={root} className={styles.section} data-section="activities">
      <div className={styles.rules} aria-hidden="true" />

      <div className={styles.head}>
        <ScrollLabel tone="accent">{T(activitiesSection.label)}</ScrollLabel>
        <MaskHeading
          as="h2"
          size="xl"
          lines={[T(activitiesSection.heading)]}
          className={styles.heading}
        />
        <RevealCopy className={styles.sub}>{T(activitiesSection.body)}</RevealCopy>
      </div>

      <div className={styles.grid}>
        {activities.map((a, i) => {
          const external = a.href === "instagram";
          const href = external ? contact.instagram : a.href;
          return (
            <a
              key={a.id}
              className={styles.card}
              data-wide={a.wide ? "true" : undefined}
              data-motion={a.motion}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer noopener" : undefined}
              onClick={(e) => onCard(e, a.href)}
            >
              <div className={styles.media}>
                <Photo name={a.image} alt="" grade="none" />
              </div>
              <span className={styles.tint} aria-hidden="true" />
              <span className={styles.flare} aria-hidden="true" />
              <span className={styles.pulse} aria-hidden="true" />

              {a.motion === "arrow" && (
                <svg className={styles.arrow} viewBox="0 0 54 12" fill="none" aria-hidden="true">
                  <path d="M2 6 H 46" className={styles.arrowShaft} />
                  <path d="M52 6 L 45 3 M52 6 L 45 9" className={styles.arrowHead} />
                </svg>
              )}

              <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>

              <span className={styles.body}>
                <span className={styles.title}>{T(a.title)}</span>
                <span className={styles.sub2}>{T(a.sub)}</span>
              </span>

              <span className={styles.go} aria-hidden="true">
                <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                  <path d="M0 4h9M6 1l3 3-3 3" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
