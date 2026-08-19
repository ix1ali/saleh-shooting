"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion, useGsap, useIsoLayoutEffect } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { brand, contact, navItems, ui } from "@/data/site";
import { buildActions } from "@/lib/actions";
import TargetRings from "@/components/motion/TargetRings";
import ActionIcon from "@/components/ui/ActionIcon";
import Ground from "@/components/visual/Ground";
import styles from "./SiteChrome.module.css";

/**
 * The persistent UI: top bar, menu overlay, scroll progress and the sticky
 * action bar. All four are suppressed during the hero so the opening sequence
 * runs edge to edge, then arrive together once the visitor is through it.
 */
export default function SiteChrome() {
  const [open, setOpen] = useState(false);
  const [past, setPast] = useState(false);
  const [section, setSection] = useState(0);
  const overlay = useRef<HTMLDivElement | null>(null);
  const bar = useRef<HTMLDivElement | null>(null);
  const quick = useRef<HTMLDivElement | null>(null);
  const progressFill = useRef<HTMLSpanElement | null>(null);
  const currentNum = useRef<HTMLSpanElement | null>(null);
  const { T, locale, toggle, version } = useLocale();

  const actions = buildActions(T);
  const primary = actions.find((a) => a.primary) ?? actions[0];
  const secondary = actions.find((a) => a.id === "directions") ?? actions[actions.length - 1];

  /* --- Chrome enters once the hero sequence is done ---------------------- */

  useGsap(
    () => {
      const heroEl = document.querySelector<HTMLElement>('[data-section="hero"]');
      if (!heroEl) return;

      /* The bar is present from the first frame — it carries the mark, and the
         top of the hero is otherwise empty. Only the action bar and the
         progress marker wait until the opening sequence is over, so they do
         not compete with the scroll cue. */
      gsap.set(bar.current, { autoAlpha: 1, y: 0 });
      gsap.set(quick.current, { autoAlpha: 0, y: 34 });

      ScrollTrigger.create({
        trigger: heroEl,
        start: "top top",
        end: "bottom 80%",
        onEnter: () => setPast(false),
        onLeave: () => setPast(true),
        onEnterBack: () => setPast(true),
        onLeaveBack: () => setPast(false),
      });
    },
    [version]
  );

  useIsoLayoutEffect(() => {
    if (!quick.current) return;
    gsap.to(quick.current, {
      autoAlpha: past ? 1 : 0,
      y: past ? 0 : 34,
      duration: prefersReducedMotion() ? 0.2 : 0.75,
      ease: "expo.out",
      overwrite: true,
    });
  }, [past]);

  /* --- Section tracking + progress ---------------------------------------- */

  useGsap(
    () => {
      /* Drive the counter from the nav chapters, not from every [data-section]
         in the document. Archery is a continuation of the disciplines rather
         than a chapter of its own, so counting raw sections would report nine
         chapters against a total of eight. */
      const sections = navItems
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => el !== null);

      sections.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            if (self.isActive) setSection(i);
          },
          onUpdate: (self) => {
            if (!self.isActive || !progressFill.current) return;
            progressFill.current.style.setProperty("--p", self.progress.toFixed(3));
          },
        });
      });
    },
    [version]
  );

  /* The chapter number rolls up rather than swapping — the same mechanical
     language the opening hours use. */
  useIsoLayoutEffect(() => {
    const el = currentNum.current;
    if (!el || prefersReducedMotion()) return;
    gsap.fromTo(el, { yPercent: 100 }, { yPercent: 0, duration: 0.55, ease: "expo.out" });
  }, [section]);

  /* --- Menu overlay -------------------------------------------------------- */

  useIsoLayoutEffect(() => {
    const el = overlay.current;
    if (!el) return;
    const rows = el.querySelectorAll<HTMLElement>("[data-nav-label]");
    const foot = el.querySelector(`.${styles.overlayFoot}`);
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      if (open) {
        gsap.set(el, { visibility: "visible" });
        const tl = gsap.timeline();
        tl.fromTo(
          el,
          { clipPath: "circle(0% at calc(100% - 42px) 48px)" },
          {
            clipPath: "circle(142% at calc(100% - 42px) 48px)",
            duration: reduced ? 0.2 : 0.85,
            ease: "expo.inOut",
          }
        );
        /* Links reveal line by line out of their own masks, after the
           overlay has opened enough that they are not revealed into black. */
        tl.fromTo(
          rows,
          { yPercent: 108 },
          { yPercent: 0, duration: reduced ? 0.2 : 0.8, ease: "expo.out", stagger: 0.055 },
          reduced ? 0 : 0.3
        );
        if (foot) {
          tl.fromTo(foot, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.4");
        }
      } else {
        gsap.to(el, {
          clipPath: "circle(0% at calc(100% - 42px) 48px)",
          duration: reduced ? 0.15 : 0.6,
          ease: "expo.inOut",
          onComplete: () => {
            gsap.set(el, { visibility: "hidden" });
          },
        });
      }
    }, el);

    return () => ctx.revert();
  }, [open, version]);

  /* The page must not scroll behind an open overlay. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const goTo = useCallback((id: string) => {
    setOpen(false);
    const target = document.getElementById(id);
    if (!target) return;
    /* Wait for the overlay close and the scroll lock to lift. */
    window.setTimeout(() => {
      target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    }, 380);
  }, []);

  const total = String(navItems.length).padStart(2, "0");
  const current = String(Math.min(section + 1, navItems.length)).padStart(2, "0");

  return (
    <>
      {/* ---- Top bar ---- */}
      <div ref={bar} className={`fixed-shell ${styles.bar}`} data-solid={past}>
        <span className={styles.barVeil} aria-hidden="true" />

        <a className={styles.brandLink} href="#hero" onClick={(e) => { e.preventDefault(); goTo("hero"); }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-mark.png" alt="" className={styles.brandMark} width={22} height={22} />
          <span className={styles.brandName}>{T(brand.name)}</span>
        </a>

        <div className={styles.barRight}>
          <button
            type="button"
            className={styles.langBtn}
            onClick={toggle}
            aria-label={locale === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
          >
            {T(ui.langToggle)}
          </button>

          <button
            type="button"
            className={styles.menuBtn}
            data-open={open}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? T(ui.close) : T(ui.menu)}
          >
            <TargetRings rings={4} weight={0.6} bullseye={false} className={styles.menuRings} />
            <span className={styles.menuBars} aria-hidden="true">
              <span className={styles.menuBar} />
              <span className={styles.menuBar} />
            </span>
          </button>
        </div>
      </div>

      {/* ---- Menu overlay ---- */}
      <div id="site-menu" ref={overlay} className={styles.overlay} data-open={open}>
        <div className={styles.overlayGround} aria-hidden="true">
          <Ground tone="deep" />
        </div>

        <nav className={styles.navList} aria-label={T(ui.menu)}>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.navRow}
              onClick={() => goTo(item.id)}
              tabIndex={open ? 0 : -1}
            >
              <span className={styles.navIndex}>{item.index}</span>
              <span className={styles.navLabelMask}>
                <span data-nav-label className={styles.navLabel}>
                  {T(item.label)}
                </span>
              </span>
            </button>
          ))}
        </nav>

        <div className={styles.overlayFoot}>
          <span>{brand.handle}</span>
          <a href={contact.instagram} target="_blank" rel="noreferrer noopener" tabIndex={open ? 0 : -1}>
            {T(ui.instagram)}
          </a>
        </div>
      </div>

      {/* ---- Scroll progress ---- */}
      <div className={styles.progress} data-visible={past && !open} aria-hidden="true">
        <span className={styles.progressNums}>
          <span className={styles.progressCurrent}>
            <span ref={currentNum}>{current}</span>
          </span>
          <span className={styles.progressTotal}>{total}</span>
        </span>
        <span className={styles.progressTrack}>
          <span ref={progressFill} className={styles.progressFill} />
        </span>
      </div>

      {/* ---- Quick actions ---- */}
      <div ref={quick} className={styles.quick}>
        <a
          className={styles.quickPrimary}
          href={primary.href}
          target={primary.external ? "_blank" : undefined}
          rel={primary.external ? "noreferrer noopener" : undefined}
        >
          <ActionIcon name={primary.icon} className={styles.actionIcon} />
          {primary.label}
        </a>
        {secondary && secondary.id !== primary.id && (
          <a
            className={styles.quickSecondary}
            href={secondary.href}
            target={secondary.external ? "_blank" : undefined}
            rel={secondary.external ? "noreferrer noopener" : undefined}
            aria-label={secondary.label}
          >
            <ActionIcon name={secondary.icon} />
          </a>
        )}
      </div>
    </>
  );
}
