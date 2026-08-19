import styles from "./Sidearm.module.css";

type Props = { className?: string };

/**
 * The pistol in the foreground of the hero, seen from behind the shooter.
 *
 * Drawn as a silhouette rather than an illustration: it reads as equipment on
 * a firing line, held level and pointed downrange at paper, which is the only
 * thing it is ever used for on this site. It is lit along its top edge by the
 * same blue the lane is lit by, so it sits in the room rather than on top of
 * the picture.
 *
 * The muzzle is at (196, 34) in this viewBox — the hero reads that point to
 * decide where the flash sits and where a round starts its travel.
 */
export default function Sidearm({ className = "" }: Props) {
  return (
    <svg
      className={`${styles.svg} ${className}`}
      viewBox="0 0 220 150"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="sa-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2B3646" />
          <stop offset="0.45" stopColor="#151C28" />
          <stop offset="1" stopColor="#0A0F18" />
        </linearGradient>
        <linearGradient id="sa-rim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6FBEFF" stopOpacity="0.15" />
          <stop offset="0.55" stopColor="#6FBEFF" stopOpacity="0.85" />
          <stop offset="1" stopColor="#DCEEFF" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Slide and frame, foreshortened as if held at eye level. */}
      <path
        d="M62 30 L196 26 L200 44 L196 50 L86 54 L78 74 L54 78 L44 62 L40 40 Z"
        fill="url(#sa-body)"
      />
      {/* Grip falling away from the camera. */}
      <path d="M52 74 L84 56 L104 108 L86 138 L58 132 Z" fill="url(#sa-body)" />
      {/* Rear sight notch. */}
      <path d="M56 28 L70 27 L70 20 L56 21 Z" fill="#0A0F18" />
      {/* Front sight. */}
      <path d="M182 26 L190 26 L190 18 L182 18 Z" fill="#0A0F18" />
      {/* Ejection port. */}
      <path d="M118 32 L154 30 L154 40 L118 42 Z" fill="#05080F" opacity="0.85" />
      {/* The rim light picked up from the lane. */}
      <path d="M62 30 L196 26 L196.6 29 L62.6 33 Z" fill="url(#sa-rim)" />
      <path d="M84 56 L104 108" stroke="#6FBEFF" strokeOpacity="0.28" strokeWidth="1.4" />
      {/* Trigger guard. */}
      <path
        d="M92 60 q 22 26 8 42"
        stroke="#0A0F18"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
