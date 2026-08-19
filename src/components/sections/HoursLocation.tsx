"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { REVEAL, START, prefersReducedMotion, useGsap } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { contact, hours, location, ui } from "@/data/site";
import { getOpenState, type OpenState } from "@/lib/hours";
import MaskHeading from "@/components/motion/MaskHeading";
import ScrollLabel from "@/components/motion/ScrollLabel";
import RollingNumber from "@/components/motion/RollingNumber";
import TargetRings from "@/components/motion/TargetRings";
import styles from "./HoursLocation.module.css";

const INITIAL: OpenState = { open: null, today: null, boundary: null, now: null };

export default function HoursLocation() {
  const root = useRef<HTMLElement | null>(null);
  const { T, version } = useLocale();
  const [state, setState] = useState<OpenState>(INITIAL);

  /* Resolved on the client only. The server has no way to know the wall clock
     in Kuwait at render time, and guessing would ship a stale "Open now". */
  useEffect(() => {
    const update = () => setState(getOpenState());
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const todayId = state.today?.id ?? null;

  useGsap(
    () => {
      const el = root.current;
      if (!el) return;

      const dashes = gsap.utils.toArray<HTMLElement>(`.${styles.timeDash}`, el);
      const addressLines = gsap.utils.toArray<HTMLElement>(`.${styles.addressLine} > span`, el);
      const map = el.querySelector(`.${styles.map}`);

      if (prefersReducedMotion()) {
        gsap.set(dashes, { scaleX: 1 });
        gsap.set(addressLines, { yPercent: 0 });
        return;
      }

      gsap.fromTo(
        dashes,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.4,
          ease: "power2.inOut",
          stagger: 0.06,
          scrollTrigger: { trigger: `.${styles.blocks}`, ...REVEAL },
        }
      );

      gsap.fromTo(
        addressLines,
        { yPercent: 106 },
        {
          yPercent: 0,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.04,
          scrollTrigger: { trigger: `.${styles.location}`, ...REVEAL },
        }
      );

      if (map) {
        gsap.fromTo(
          map,
          { clipPath: "inset(0% 0% 100% 0%)", scale: 1.06 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            scale: 1,
            duration: 0.55,
            ease: "power3.out",
            scrollTrigger: { trigger: map, ...REVEAL },
          }
        );
      }
    },
    [version]
  );

  const statusLabel =
    state.open === null ? "" : state.open ? T(ui.openNow) : T(ui.closedNow);

  const boundaryLabel =
    state.open === null || !state.boundary
      ? ""
      : `${state.open ? T(ui.closesAt) : T(ui.opensAt)} ${state.boundary}`;

  const addressLines = [T(location.line1), T(location.line2), T(location.line3)];

  return (
    <section id="visit" ref={root} className={styles.section} data-section="visit">
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.content}>
        <ScrollLabel>{T(ui.visit)}</ScrollLabel>

        {/* Reserves its own height so the status resolving on the client never
            shifts the layout underneath it. */}
        <div className={styles.status} data-open={state.open === true}>
          <span className={styles.statusDot} aria-hidden="true" />
          <span className={styles.statusText}>{statusLabel}</span>
          {boundaryLabel && <span className={styles.statusMeta}>{boundaryLabel}</span>}
        </div>

        <div className={styles.blocks}>
          {hours.map((block) => (
            <div key={block.id} className={styles.block}>
              <div className={styles.blockHead}>
                <span className={styles.blockLabel}>{T(block.label)}</span>
                {todayId === block.id && (
                  <span className={styles.blockToday}>{T(ui.today)}</span>
                )}
              </div>
              <div className={styles.times}>
                <RollingNumber value={block.open} size="lg" className={styles.time} />
                <span className={styles.timeDash} aria-hidden="true" />
                <RollingNumber value={block.close} size="lg" className={styles.time} />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.location}>
          <MaskHeading as="h2" size="md" lines={[T(location.mapsLabel)]} />

          <div className={styles.addressLines}>
            {addressLines.map((line, i) => (
              <span key={i} className={styles.addressLine}>
                <span>{line}</span>
              </span>
            ))}
          </div>

          <p className={styles.mapsLabel}>
            {T(ui.kuwaitTime)}
            {state.now ? ` — ${state.now}` : ""}
          </p>

          <a
            className={styles.map}
            href={contact.mapsUrl}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${T(ui.directions)} — ${T(location.mapsLabel)}`}
          >
            <svg className={styles.mapSvg} viewBox="0 0 160 100" fill="none" aria-hidden="true">
              <path className={styles.mapRoadMain} d="M0 68 H 160" />
              <path className={styles.mapRoadMain} d="M96 0 V 100" />
              <path className={styles.mapRoad} d="M0 30 H 68 M0 88 H 160" />
              <path className={styles.mapRoad} d="M34 30 V 100 M126 0 V 68" />
              <path className={styles.mapRoad} d="M68 0 V 30 M96 44 H 160" />
            </svg>
            <TargetRings rings={4} weight={0.7} bullseye className={styles.mapPin} />
            <span className={styles.mapCta}>
              {T(ui.directions)}
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                <path d="M0 5h12M8.5 1L12.5 5L8.5 9" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
