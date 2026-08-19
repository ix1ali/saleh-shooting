import type { IconName } from "@/lib/actions";

type Props = { name: IconName; className?: string };

/** Line icons drawn on a single 24-unit grid at a single weight, so they sit
    together without one looking heavier than the next. */
export default function ActionIcon({ name, className = "" }: Props) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
    focusable: false as const,
  };

  switch (name) {
    case "instagram":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...common}>
          <path d="M20.5 11.7a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.4-4.5a8.4 8.4 0 1 1 15.6-4.3Z" />
          <path d="M9 9.4c0 3 2.6 5.6 5.6 5.6l.9-1.6-2-1-.9.9a5 5 0 0 1-1.9-1.9l.9-.9-1-2-1.6.9Z" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M6.2 3.5h3l1.5 3.8-1.9 1.4a11.5 11.5 0 0 0 5.5 5.5l1.4-1.9 3.8 1.5v3a1.7 1.7 0 0 1-1.9 1.7A15.6 15.6 0 0 1 4.5 5.4a1.7 1.7 0 0 1 1.7-1.9Z" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M12 21s6.5-5.6 6.5-10.2a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z" />
          <circle cx="12" cy="10.6" r="2.4" />
        </svg>
      );
  }
}
