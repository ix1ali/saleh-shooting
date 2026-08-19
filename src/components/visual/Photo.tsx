import styles from "./Photo.module.css";

type Props = {
  /** Base filename in /public/media, without extension. */
  name: string;
  alt: string;
  className?: string;
  /** How hard the brand grade sits over the photograph. */
  grade?: "none" | "soft" | "medium" | "heavy";
  /** Load immediately rather than lazily. Use for the hero only. */
  priority?: boolean;
  /** Focal point for the crop. */
  position?: string;
  /** Black and white, lifted so the subject reads on a dark page. */
  mono?: boolean;
};

/**
 * A photograph from the facility.
 *
 * AVIF first, WebP second — both are generated at build time from the source
 * material, so nothing hotlinks Instagram (their CDN URLs are signed and
 * expire within days).
 *
 * The grade layer is what keeps a set of phone photographs shot under
 * different lighting reading as one campaign. It is deliberately lighter than
 * a typical "darken everything" overlay: this facility is bright, busy and
 * family-facing, and crushing its photography into a moody near-black would
 * misrepresent the place. The dark chrome around the image does the work of
 * making it feel premium; the photograph itself stays legible.
 */
export default function Photo({
  name,
  alt,
  className = "",
  grade = "medium",
  priority = false,
  position = "center",
  mono = false,
}: Props) {
  return (
    <div className={`${styles.wrap} ${className}`} data-grade={grade} data-mono={mono}>
      <picture>
        <source srcSet={`/media/${name}.avif`} type="image/avif" />
        <source srcSet={`/media/${name}.webp`} type="image/webp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/media/${name}.webp`}
          alt={alt}
          className={styles.img}
          style={{ objectPosition: position }}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          width={900}
          height={1200}
        />
      </picture>
      <span className={styles.grade} aria-hidden="true" />
    </div>
  );
}
