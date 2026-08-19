"use client";

import styles from "./TargetRings.module.css";

type Props = {
  /** Number of scoring rings drawn outward from the bullseye. */
  rings?: number;
  className?: string;
  /** Hairline weight in viewBox units. */
  weight?: number;
  tone?: "bone" | "mist" | "accent" | "mixed";
  /** Draws the filled centre. The hero uses this as its transition portal. */
  bullseye?: boolean;
  /** Adds the four cardinal sight ticks. */
  ticks?: boolean;
  style?: React.CSSProperties;
};

/**
 * The brand motif. Concentric scoring rings, used deliberately: as the hero's
 * transition portal, as the mask around photography, behind display type, and
 * as the loader. Pure SVG so it stays crisp at any scale.
 */
export default function TargetRings({
  rings = 7,
  className = "",
  weight = 0.5,
  tone = "bone",
  bullseye = true,
  ticks = false,
  style,
}: Props) {
  const step = 50 / (rings + 0.6);

  return (
    <svg
      className={`${styles.svg} ${className}`}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
      data-tone={tone}
      style={style}
    >
      {Array.from({ length: rings }).map((_, i) => {
        const r = step * (i + 1);
        /* Outer rings sit back; inner rings carry more presence. */
        const o = 0.22 + (i / rings) * 0.6;
        return (
          <circle
            key={i}
            className={styles.ring}
            cx="50"
            cy="50"
            r={r}
            strokeWidth={weight}
            style={{ opacity: o }}
            data-ring={i}
          />
        );
      })}

      {ticks && (
        <g className={styles.ticks} strokeWidth={weight}>
          <line x1="50" y1="2" x2="50" y2="9" />
          <line x1="50" y1="91" x2="50" y2="98" />
          <line x1="2" y1="50" x2="9" y2="50" />
          <line x1="91" y1="50" x2="98" y2="50" />
        </g>
      )}

      {bullseye && <circle className={styles.bull} cx="50" cy="50" r={step * 0.62} />}
    </svg>
  );
}
