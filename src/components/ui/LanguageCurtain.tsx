"use client";

import type { Locale } from "@/data/site";
import styles from "./LanguageCurtain.module.css";

type Props = { active: boolean; locale: Locale };

/**
 * The curtain that covers the page while the language changes.
 *
 * It closes from the trailing edge and lifts from the leading edge of the
 * script being switched *to*, so the direction of the wipe matches the
 * direction of the language arriving. The label in the middle names the
 * language, which makes a half-second wait feel like a deliberate step
 * rather than a stall.
 */
export default function LanguageCurtain({ active, locale }: Props) {
  /* While switching, the incoming script is the opposite of the current one. */
  const incoming: Locale = locale === "en" ? "ar" : "en";

  return (
    <div
      className={styles.curtain}
      data-active={active}
      data-incoming={incoming}
      aria-hidden="true"
    >
      <div className={styles.panel} />
      <span className={styles.label}>{incoming === "ar" ? "العربية" : "English"}</span>
      <span className={styles.rule} />
    </div>
  );
}
