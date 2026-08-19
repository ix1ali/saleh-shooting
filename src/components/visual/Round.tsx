import styles from "./Round.module.css";

type Props = { className?: string };

/**
 * The round in flight.
 *
 * Drawn nose-away, seen from just behind and above, so it reads as travelling
 * down the lane rather than across the frame. Copper jacket over a lead core,
 * with a specular run down the lit side and a cool rim picked up from the LED
 * strips on the walls — the same two light sources everything else in the hero
 * is lit by.
 *
 * It lives inside the camera space, so perspective shrinks it as it goes and
 * it converges on the vanishing point on its own.
 */
export default function Round({ className = "" }: Props) {
  return (
    <svg
      className={`${styles.svg} ${className}`}
      viewBox="0 0 120 260"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Across the body: shadow side, lit side, blue rim. */}
        <linearGradient id="rd-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3A1F0E" />
          <stop offset="0.18" stopColor="#8A4E1E" />
          <stop offset="0.42" stopColor="#C68B45" />
          <stop offset="0.54" stopColor="#EAC894" />
          <stop offset="0.68" stopColor="#A96D2C" />
          <stop offset="0.88" stopColor="#5C3111" />
          <stop offset="1" stopColor="#8FC7F5" />
        </linearGradient>
        {/* The nose catches more of the downrange light. */}
        <linearGradient id="rd-nose" x1="0" y1="1" x2="0.6" y2="0">
          <stop offset="0" stopColor="#C98A42" />
          <stop offset="0.55" stopColor="#F2CE96" />
          <stop offset="1" stopColor="#FFF3DF" />
        </linearGradient>
        <linearGradient id="rd-base" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2A1608" />
          <stop offset="0.5" stopColor="#6B3D17" />
          <stop offset="1" stopColor="#2A1608" />
        </linearGradient>
        <linearGradient id="rd-trail" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9FD2FF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#9FD2FF" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="rd-tip" cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Disturbed air behind the round. */}
      <path d="M46 214 L74 214 L86 260 L34 260 Z" fill="url(#rd-trail)" opacity="0.5" />

      {/* Body: parallel sides from the base up to the start of the ogive. */}
      <path d="M32 208 L32 108 L88 108 L88 208 Z" fill="url(#rd-body)" />

      {/* Ogive nose. */}
      <path d="M32 108 Q 34 46 60 18 Q 86 46 88 108 Z" fill="url(#rd-nose)" />

      {/* Cannelure, the crimp groove around the jacket. */}
      <path d="M32 168 L88 168 L88 178 L32 178 Z" fill="#4A2810" opacity="0.55" />
      <path d="M32 168 L88 168" stroke="#FFE1B4" strokeOpacity="0.35" strokeWidth="1" />

      {/* Base, seen at a shallow angle from behind. */}
      <ellipse cx="60" cy="208" rx="28" ry="9" fill="url(#rd-base)" />
      <ellipse cx="60" cy="206" rx="28" ry="9" fill="#1A0D04" opacity="0.65" />

      {/* Specular run down the lit side. */}
      <path
        d="M52 112 Q 50 160 52 202"
        stroke="#FFF6E6"
        strokeOpacity="0.75"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Cool rim from the wall strips. */}
      <path
        d="M86 112 Q 88 158 86 200"
        stroke="#BFE2FF"
        strokeOpacity="0.6"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Highlight on the tip. */}
      <circle cx="60" cy="30" r="14" fill="url(#rd-tip)" />
    </svg>
  );
}
