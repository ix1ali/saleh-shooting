"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SCRUB, prefersReducedMotion, useGsap } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { brand, contactSection, hours } from "@/data/site";
import { buildActions } from "@/lib/actions";
import TrackingIn from "@/components/motion/TrackingIn";
import RevealCopy from "@/components/motion/RevealCopy";
import ScrollLabel from "@/components/motion/ScrollLabel";
import TargetRings from "@/components/motion/TargetRings";
import Photo from "@/components/visual/Photo";
import ActionIcon from "@/components/ui/ActionIcon";
import styles from "./ContactCTA.module.css";

export default function ContactCTA() {
  const root = useRef<HTMLDivElement | null>(null);
  const panel = useRef<HTMLElement | null>(null);
  const rings = useRef<HTMLDivElement | null>(null);
  const { T, version } = useLocale();

  const actions = buildActions(T);

  useGsap(
    () => {
      const el = panel.current;
      if (!el) return;

      const items = gsap.utils.toArray<HTMLElement>(`.${styles.action}`, el);
      const signoff = el.querySelector(`.${styles.signoff}`);
      const closing = el.querySelector(`.${styles.closing}`);

      if (prefersReducedMotion()) {
        gsap.fromTo(
          [...items, signoff, closing],
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.3, stagger: 0.04, scrollTrigger: { trigger: el, start: "top 80%", once: true } }
        );
        return;
      }

      /* The panel rises over the section above it, which is compressed and
         darkened by its own trigger further up the page. */
      gsap.fromTo(
        el,
        { yPercent: 9 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "top top", scrub: SCRUB.soft },
        }
      );

      const backdrop = el.querySelector(`.${styles.backdrop}`);
      if (backdrop) {
        gsap.fromTo(
          backdrop,
          { yPercent: -7, scale: 1.12 },
          {
            yPercent: 5,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: SCRUB.tight },
          }
        );
      }

      if (rings.current) {
        gsap.fromTo(
          rings.current,
          { scale: 0.72, rotate: -8 },
          {
            scale: 1.08,
            rotate: 6,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: SCRUB.tight },
          }
        );
      }

      const tl = gsap.timeline({
        scrollTrigger: { trigger: `.${styles.actions}`, start: "top 86%", once: true },
      });

      tl.fromTo(
        items,
        { yPercent: 42, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.85, ease: "expo.out", stagger: 0.075 }
      )
        /* The mark lands last. The page finishes on the logo. */
        .fromTo(
          signoff,
          { yPercent: 26, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out" },
          "-=0.35"
        )
        .fromTo(
          closing,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.7 },
          "-=0.5"
        );
    },
    [version]
  );

  return (
    <div ref={root} className={styles.outer}>
      <section id="contact" ref={panel} className={styles.section} data-section="contact">
        {/* The closing frame is the archery hall — the calmest room on site,
            and the one that reads best behind type. */}
        <div className={styles.backdrop} aria-hidden="true">
          <Photo name="archery" alt="" grade="none" position="center 30%" />
        </div>
        <div className={styles.ground} aria-hidden="true" />
        <div ref={rings} className={styles.rings} aria-hidden="true">
          <TargetRings rings={10} weight={0.3} bullseye={false} />
        </div>

        <div className={styles.content}>
          <ScrollLabel tone="accent">{T(contactSection.label)}</ScrollLabel>

          <div className={styles.headingWrap}>
            {contactSection.headingLines.map((line, i) => (
              <TrackingIn
                key={i}
                as={i === 0 ? "h2" : "p"}
                size="xl"
                delay={i * 0.12}
                from={0.34 - i * 0.06}
                className={styles.headingLine}
              >
                {T(line)}
              </TrackingIn>
            ))}
          </div>

          <RevealCopy className={styles.copy}>{T(contactSection.body)}</RevealCopy>

          <div className={styles.actions}>
            {actions.map((a) => (
              <a
                key={a.id}
                className={styles.action}
                data-primary={a.primary}
                href={a.href}
                target={a.external ? "_blank" : undefined}
                rel={a.external ? "noreferrer noopener" : undefined}
              >
                <ActionIcon name={a.icon} className={styles.actionIcon} />
                <span className={styles.actionLabel}>{a.label}</span>
                <svg
                  className={styles.actionArrow}
                  width="14"
                  height="10"
                  viewBox="0 0 14 10"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M0 5h12M8.5 1L12.5 5L8.5 9" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </a>
            ))}
          </div>

          <div className={styles.signoff}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-mark.png"
              alt=""
              className={styles.mark}
              width={42}
              height={42}
              loading="lazy"
            />
            <span className={styles.signText}>
              <span className={styles.signName}>{T(brand.name)}</span>
              <span className={styles.signHandle}>{brand.handle}</span>
            </span>
          </div>

          <p className={styles.closing}>{T(contactSection.closing)}</p>

          {/* The last line on the page carries the opening hours rather than a
              decorative label — it is the thing a visitor is most likely to
              still need at the bottom of the page. */}
          <div className={styles.legal}>
            {hours.map((h) => (
              <span key={h.id} className={styles.legalItem}>
                <span className={styles.legalDays}>{T(h.short)}</span>
                <span className={styles.legalTime}>
                  {h.open}–{h.close}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
