import { hours, timezone, type HourBlock } from "@/data/site";

export type OpenState = {
  /** null until resolved on the client, so nothing is rendered speculatively. */
  open: boolean | null;
  /** The block covering today, if any. */
  today: HourBlock | null;
  /** "HH:MM" the facility next opens or closes at. */
  boundary: string | null;
  /** Local time at the facility, "HH:MM". */
  now: string | null;
};

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Reads the wall clock at the facility rather than on the visitor's device.
 *
 * A visitor in another timezone must not be told the range is open because it
 * happens to be 4pm where they are standing, so the day index and the time
 * are both taken from Asia/Kuwait via Intl rather than from local Date parts.
 */
export function getFacilityNow(): { day: number; minutes: number; label: string } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = fmt.formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = Math.max(0, DAYS.indexOf(get("weekday")));

  /* Intl renders midnight as "24" in some ICU versions under hour12:false. */
  const hour = Number(get("hour")) % 24;
  const minute = Number(get("minute"));

  return {
    day,
    minutes: hour * 60 + minute,
    label: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  };
}

export function getOpenState(): OpenState {
  const { day, minutes, label } = getFacilityNow();
  const today = hours.find((b) => b.days.includes(day)) ?? null;

  if (!today) return { open: false, today: null, boundary: null, now: label };

  const open = toMinutes(today.open);
  const close = toMinutes(today.close);
  const isOpen = minutes >= open && minutes < close;

  return {
    open: isOpen,
    today,
    boundary: isOpen ? today.close : minutes < open ? today.open : null,
    now: label,
  };
}

/** Formats "22:30" for display. Times are always shown on a 24-hour clock so
    the two blocks line up in a column, in either language. */
export function formatTime(hhmm: string): string {
  return hhmm;
}
