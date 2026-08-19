import styles from "./Ground.module.css";

type Props = {
  /** Which environment this ground represents. */
  tone?: "intro" | "deep" | "accent";
  className?: string;
};

/**
 * The shared ground of the site: a graded field that stands in for the range
 * environment. The hero paints this inside its transition portal and the
 * Intro section paints the same thing full-bleed, so when the portal finishes
 * opening there is no seam between the two sections — the visitor has simply
 * walked through the bullseye into the next room.
 */
export default function Ground({ tone = "intro", className = "" }: Props) {
  return (
    <div className={`${styles.ground} ${className}`} data-tone={tone} aria-hidden="true">
      <div className={styles.floorGlow} />
      <div className={styles.beam} />
      <div className={styles.grain} />
    </div>
  );
}
