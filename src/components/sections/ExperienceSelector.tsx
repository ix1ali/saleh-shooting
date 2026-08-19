"use client";

import { useCallback, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion, useIsoLayoutEffect } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { contact, recommendations, selector } from "@/data/site";
import MaskHeading from "@/components/motion/MaskHeading";
import ScrollLabel from "@/components/motion/ScrollLabel";
import RevealCopy from "@/components/motion/RevealCopy";
import TargetRings from "@/components/motion/TargetRings";
import styles from "./ExperienceSelector.module.css";

const QUESTIONS = selector.questions;

/**
 * Picks a discipline from the three answers.
 *
 * The logic is deliberately transparent: a stated interest always wins. Only
 * "surprise me" defers to the other two answers, and it then leans on group
 * size and experience rather than choosing at random — a first-timer with
 * family gets pointed somewhere calmer than a returning visitor with friends.
 */
function recommend(answers: Record<string, string>): string {
  const { first, interest, party } = answers;
  if (interest && interest !== "surprise") return interest;
  if (party === "group" || party === "friends") return "shotgun";
  if (party === "family") return "archery";
  return first === "yes" ? "pistol" : "rifle";
}

export default function ExperienceSelector() {
  const root = useRef<HTMLElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { T, version } = useLocale();

  const total = QUESTIONS.length;
  const done = step >= total;
  const result = done ? recommend(answers) : null;

  /* Each stage change is a short, self-contained transition: the current step
     leaves upward, the incoming one arrives from below. Never a cross-fade. */
  useIsoLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const current = el.querySelector<HTMLElement>("[data-live]");
    if (!current) return;

    if (prefersReducedMotion()) {
      gsap.fromTo(current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(
        current,
        { yPercent: 14, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: "expo.out" }
      );

      const options = current.querySelectorAll("[data-option]");
      if (options.length) {
        tl.fromTo(
          options,
          { yPercent: 26, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.055, ease: "power3.out" },
          0.1
        );
      }

      /* The result does not slide in: it expands out of the ring at its
         centre, so the answer feels produced rather than delivered. */
      const ring = current.querySelector(`.${styles.resultRing}`);
      const card = current.querySelector(`.${styles.resultCard}`);
      if (ring && card) {
        tl.fromTo(ring, { scale: 0.15, autoAlpha: 0 }, { scale: 1, autoAlpha: 0.2, duration: 1.1, ease: "expo.out" }, 0);
        tl.fromTo(
          card,
          { clipPath: "inset(46% 12% 46% 12%)", autoAlpha: 0 },
          { clipPath: "inset(0% 0% 0% 0%)", autoAlpha: 1, duration: 0.85, ease: "expo.out" },
          0.14
        );
      }
    }, el);

    return () => ctx.revert();
  }, [step, version]);

  const answer = useCallback(
    (questionId: string, optionId: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
      const el = stage.current?.querySelector<HTMLElement>("[data-live]");

      const advance = () => setStep((s) => s + 1);

      if (!el || prefersReducedMotion()) {
        window.setTimeout(advance, 120);
        return;
      }

      /* Hold briefly so the selected option can register its own state, then
         send the whole stage up and out before the next one is mounted. */
      gsap.to(el, {
        yPercent: -18,
        autoAlpha: 0,
        duration: 0.42,
        ease: "power2.in",
        delay: 0.22,
        onComplete: advance,
      });
    },
    []
  );

  const restart = useCallback(() => {
    const el = stage.current?.querySelector<HTMLElement>("[data-live]");
    const reset = () => {
      setAnswers({});
      setStep(0);
    };
    if (!el || prefersReducedMotion()) {
      reset();
      return;
    }
    gsap.to(el, { yPercent: -14, autoAlpha: 0, duration: 0.36, ease: "power2.in", onComplete: reset });
  }, []);

  const progress = done ? 1 : step / total;
  const q = done ? null : QUESTIONS[step];
  const rec = result ? recommendations[result] : null;

  return (
    <section id="selector" ref={root} className={styles.section} data-section="selector">
      <ScrollLabel>{T(selector.label)}</ScrollLabel>

      <MaskHeading
        as="h2"
        size="lg"
        lines={[T(selector.heading)]}
        className={styles.heading}
      />

      <div className={styles.progress}>
        <span className={styles.count}>
          {String(Math.min(step + (done ? 0 : 1), total)).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span className={styles.track}>
          <span className={styles.fill} style={{ "--progress": progress } as React.CSSProperties} />
        </span>
      </div>

      <div ref={stage} className={styles.stage}>
        {q && (
          <div key={q.id} data-live className={styles.step}>
            <h3 className={styles.prompt}>{T(q.prompt)}</h3>
            <div className={styles.options}>
              {q.options.map((opt) => (
                <button
                  key={opt.id}
                  data-option
                  type="button"
                  className={styles.option}
                  data-selected={answers[q.id] === opt.id}
                  onClick={() => answer(q.id, opt.id)}
                >
                  <span>{T(opt.label)}</span>
                  <span className={styles.optionMark} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}

        {done && rec && (
          <div key="result" data-live className={styles.result}>
            <TargetRings
              rings={6}
              weight={0.5}
              bullseye={false}
              tone="accent"
              className={styles.resultRing}
            />
            <div className={styles.resultCard}>
              <span className={styles.resultKicker}>{T(selector.resultKicker)}</span>
              <span className={styles.resultTitle}>{T(rec.title)}</span>
              <RevealCopy className={styles.resultBody}>{T(rec.body)}</RevealCopy>

              <div className={styles.resultActions}>
                <a
                  className={styles.resultCta}
                  href={contact.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {T(selector.resultCta)}
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                    <path d="M0 5h12M8.5 1L12.5 5L8.5 9" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </a>
                <button type="button" className={styles.restart} onClick={restart}>
                  {T(selector.restart)}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Announces the outcome to assistive technology without stealing focus. */}
      <p className="sr-only" role="status" aria-live="polite">
        {rec ? `${T(selector.resultKicker)} ${T(rec.title)}` : `${step + 1} / ${total}`}
      </p>
    </section>
  );
}
