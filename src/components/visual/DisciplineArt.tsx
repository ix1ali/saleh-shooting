import type { ExperienceVisual } from "@/data/site";
import Photo from "./Photo";
import styles from "./DisciplineArt.module.css";

type Props = {
  visual: ExperienceVisual;
  /** Real photograph path. When present the artwork is replaced entirely. */
  image?: string | null;
  alt?: string;
  className?: string;
};

/**
 * Art direction for a discipline panel.
 *
 * These are brand-graded procedural compositions, not photographs and not
 * stock. Each one is built from the geometry of its own discipline — lane
 * markings, group patterns, spread cones, sight lines — so the panel says
 * something true about the sport rather than borrowing a generic range photo.
 *
 * Drop a real image path into the matching entry in `data/site.ts` and it is
 * used instead, inside the same grade and the same mask.
 */
export default function DisciplineArt({ visual, image, alt = "", className = "" }: Props) {
  if (image) {
    /* A real photograph replaces the drawing entirely. The grade is applied by
       Photo, so a panel looks the same whichever path it takes. */
    return <Photo name={image} alt={alt} grade="medium" className={className} />;
  }

  return (
    <div className={`${styles.art} ${className}`} data-visual={visual} aria-hidden="true">
      <div className={styles.field} />

      {visual === "pistol" && (
        <svg viewBox="0 0 200 300" className={styles.geo} fill="none">
          {/* A tight group at close distance: the point of handgun practice. */}
          <circle cx="100" cy="140" r="62" className={styles.ringWide} />
          <circle cx="100" cy="140" r="40" className={styles.ringWide} />
          <circle cx="100" cy="140" r="20" className={styles.ringMid} />
          <g className={styles.hits}>
            <circle cx="96" cy="136" r="3.2" />
            <circle cx="103" cy="141" r="3.2" />
            <circle cx="99" cy="146" r="3.2" />
            <circle cx="106" cy="134" r="3.2" />
            <circle cx="93" cy="143" r="3.2" />
          </g>
          <path d="M100 40 V 78 M100 202 V 240" className={styles.sight} />
          <path d="M30 140 H 68 M132 140 H 170" className={styles.sight} />
        </svg>
      )}

      {visual === "rifle" && (
        <svg viewBox="0 0 200 300" className={styles.geo} fill="none">
          {/* Distance: converging lane lines with range marks along them. */}
          <path d="M8 296 L 86 76" className={styles.lane} />
          <path d="M192 296 L 114 76" className={styles.lane} />
          <path d="M46 186 H 154" className={styles.mark} />
          <path d="M62 142 H 138" className={styles.mark} />
          <path d="M74 110 H 126" className={styles.mark} />
          <circle cx="100" cy="78" r="15" className={styles.ringMid} />
          <circle cx="100" cy="78" r="6" className={styles.bull} />
          <text x="40" y="180" className={styles.tick}>25</text>
          <text x="56" y="136" className={styles.tick}>50</text>
        </svg>
      )}

      {visual === "shotgun" && (
        <svg viewBox="0 0 200 300" className={styles.geo} fill="none">
          {/* Spread: a widening cone and a scattered pattern, not a group. */}
          <path d="M100 250 L 26 70" className={styles.lane} />
          <path d="M100 250 L 174 70" className={styles.lane} />
          <ellipse cx="100" cy="112" rx="62" ry="46" className={styles.ringWide} />
          <ellipse cx="100" cy="112" rx="38" ry="28" className={styles.ringWide} />
          <g className={styles.hits}>
            <circle cx="72" cy="98" r="2.6" /><circle cx="118" cy="92" r="2.6" />
            <circle cx="94" cy="128" r="2.6" /><circle cx="136" cy="120" r="2.6" />
            <circle cx="62" cy="126" r="2.6" /><circle cx="108" cy="106" r="2.6" />
            <circle cx="84" cy="82" r="2.6" /><circle cx="126" cy="140" r="2.6" />
            <circle cx="100" cy="150" r="2.6" /><circle cx="150" cy="104" r="2.6" />
          </g>
        </svg>
      )}

      {visual === "archery" && (
        <svg viewBox="0 0 200 300" className={styles.geo} fill="none">
          {/* Draw and release: an arc under tension and a single flight line. */}
          <path d="M64 46 Q 26 150 64 254" className={styles.bow} />
          <path d="M64 46 L 88 150 L 64 254" className={styles.string} />
          <path d="M88 150 H 178" className={styles.arrow} />
          <path d="M178 150 L 168 145 M178 150 L 168 155" className={styles.arrow} />
          <path d="M92 150 L 100 145 M92 150 L 100 155" className={styles.fletch} />
          <circle cx="150" cy="150" r="30" className={styles.ringWide} />
          <circle cx="150" cy="150" r="15" className={styles.ringMid} />
        </svg>
      )}

      <div className={styles.grade} />
    </div>
  );
}
