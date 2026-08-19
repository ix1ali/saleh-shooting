import type { ArmType } from "@/data/site";
import styles from "./ArmSilhouette.module.css";

type Props = { type: ArmType; className?: string };

/**
 * Shaded profiles for the locker list.
 *
 * Rendered rather than outlined: each body is filled with a top-lit gradient
 * and carries a highlight along its upper edge and a cool rim along its lower
 * one, which is the same two-source lighting the photography on this site has.
 * At list size that reads as an object with volume rather than a flat icon.
 *
 * These are still placeholders. Set `image` on the matching row in
 * `data/site.ts` to swap in a photograph of the actual rack.
 */
export default function ArmSilhouette({ type, className = "" }: Props) {
  const uid = `arm-${type}`;

  return (
    <svg
      viewBox="0 0 240 84"
      fill="none"
      className={`${styles.svg} ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${uid}-steel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8A97AC" />
          <stop offset="0.34" stopColor="#4E5A6E" />
          <stop offset="0.72" stopColor="#2A3342" />
          <stop offset="1" stopColor="#161D28" />
        </linearGradient>
        <linearGradient id={`${uid}-grip`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#39424F" />
          <stop offset="1" stopColor="#141A23" />
        </linearGradient>
        <linearGradient id={`${uid}-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8A6136" />
          <stop offset="0.5" stopColor="#5E4022" />
          <stop offset="1" stopColor="#33210F" />
        </linearGradient>
      </defs>

      <g className={styles.art}>
        {type === "pistol" && (
          <>
            <path d="M34 24 H 152 L 152 40 H 106 L 94 45 H 72 L 60 68 H 38 L 32 45 Z" fill={`url(#${uid}-steel)`} />
            <path d="M60 68 H 38 L 32 45 H 60 Z" fill={`url(#${uid}-grip)`} />
            <path d="M34 24 H 152 L 152 28 H 34 Z" className={styles.hi} />
            <path d="M32 45 H 94" className={styles.rim} />
            <path d="M76 45 q 11 12 5 20" className={styles.line} />
            <rect x="38" y="18" width="22" height="6" fill="#0E141D" />
            <rect x="144" y="17" width="7" height="7" fill="#0E141D" />
          </>
        )}

        {type === "revolver" && (
          <>
            <path d="M52 26 H 172 V 38 H 118 L 108 44 H 66 L 54 68 H 32 L 32 44 Z" fill={`url(#${uid}-steel)`} />
            <path d="M54 68 H 32 L 32 44 H 60 Z" fill={`url(#${uid}-grip)`} />
            <circle cx="99" cy="41" r="14" fill={`url(#${uid}-steel)`} />
            <circle cx="99" cy="41" r="14" className={styles.line} />
            <circle cx="99" cy="41" r="4.4" fill="#0C1219" />
            <path d="M52 26 H 172 V 30 H 52 Z" className={styles.hi} />
            <path d="M118 38 q 9 12 3 18" className={styles.line} />
          </>
        )}

        {type === "rifle" && (
          <>
            <path d="M12 32 H 30 V 24 H 96 L 110 33 H 218 V 42 H 122 L 112 49 H 92 L 80 70 H 54 L 42 49 H 30 V 42 H 12 Z" fill={`url(#${uid}-steel)`} />
            <path d="M80 70 H 54 L 42 49 H 74 Z" fill={`url(#${uid}-grip)`} />
            <path d="M110 33 H 218 V 37 H 110 Z" className={styles.hi} />
            <path d="M12 36 H 30" className={styles.rim} />
            <rect x="126" y="18" width="54" height="8" rx="3" fill={`url(#${uid}-steel)`} />
            <rect x="126" y="18" width="54" height="3" rx="1.5" className={styles.hiFill} />
            <path d="M142 26 V 33 M166 26 V 33" className={styles.line} />
            <path d="M96 49 q 11 12 5 19" className={styles.line} />
            <path d="M196 42 V 54 H 178 V 42 Z" fill={`url(#${uid}-grip)`} />
          </>
        )}

        {type === "shotgun" && (
          <>
            <path d="M16 28 H 148 L 162 37 H 178 L 196 58 H 220 V 68 H 186 L 166 50 H 148 L 148 41 H 16 Z" fill={`url(#${uid}-steel)`} />
            <path d="M196 58 H 220 V 68 H 186 Z" fill={`url(#${uid}-wood)`} />
            <path d="M16 28 H 148 V 32 H 16 Z" className={styles.hi} />
            <path d="M16 34.5 H 148" className={styles.line} />
            <path d="M16 41 H 148" className={styles.rim} />
            <path d="M150 41 q 9 11 3 17" className={styles.line} />
          </>
        )}

        {type === "bow" && (
          <>
            <path d="M96 6 q -36 36 0 72 l 7 -4 q -30 -32 0 -64 Z" fill={`url(#${uid}-wood)`} />
            <path d="M96 6 q -36 36 0 72" className={styles.rim} />
            <path d="M96 6 L 112 42 L 96 78" className={styles.string} />
            <rect x="86" y="30" width="18" height="24" rx="3" fill={`url(#${uid}-grip)`} />
            <path d="M112 42 H 210" className={styles.shaft} />
            <path d="M210 42 L 199 37 M210 42 L 199 47" className={styles.head} />
            <path d="M116 42 L 127 37 M116 42 L 127 47" className={styles.fletch} />
          </>
        )}
      </g>
    </svg>
  );
}
