/* =============================================================================
   CATALOGUE — firearms, round packages and prices
   -----------------------------------------------------------------------------
   THE ONLY PLACE prices, packages and availability are defined. Nothing in the
   UI hard-codes a price. Change a number here and it changes everywhere:
   shop, cart, checkout, order and receipt.

   ALL PRICES BELOW ARE PLACEHOLDERS. Replace them with the real menu before
   this goes anywhere near a paying customer.

   Currency is Kuwaiti Dinar. Amounts are held in FILS (1 KD = 1000 fils) as
   integers, never floats — money must not be summed in floating point.
   ========================================================================== */

import type { I18n } from "./site";

const t = (en: string, ar: string): I18n => ({ en, ar });

export const KD = 1000; // fils per dinar

/** Formats fils for display, e.g. 10500 -> "KD 10.500". */
export function formatKD(fils: number): string {
  const sign = fils < 0 ? "-" : "";
  const abs = Math.abs(fils);
  const dinars = Math.floor(abs / KD);
  const rest = abs % KD;
  return rest === 0
    ? `${sign}KD ${dinars}`
    : `${sign}KD ${dinars}.${String(rest).padStart(3, "0").replace(/0+$/, "")}`;
}

export type RangeId = "pistol" | "rifle" | "shotgun" | "archery";

export type RangeMeta = {
  id: RangeId;
  name: I18n;
  /** What a package of this range is counted in. */
  unit: I18n;
  unitOne: I18n;
  image: string;
  blurb: I18n;
};

export const ranges: RangeMeta[] = [
  {
    id: "pistol",
    name: t("Pistol", "المسدس"),
    unit: t("rounds", "طلقة"),
    unitOne: t("round", "طلقة"),
    image: "pistol",
    blurb: t("Indoor lanes, close distance.", "ميادين داخلية، مسافة قريبة."),
  },
  {
    id: "rifle",
    name: t("Rifle", "البندقية"),
    unit: t("rounds", "طلقة"),
    unitOne: t("round", "طلقة"),
    image: "rifle",
    blurb: t("Long lanes, shot from a bench.", "ميادين طويلة، رماية من منضدة."),
  },
  {
    id: "shotgun",
    name: t("Shotgun", "الشوزن"),
    unit: t("shots", "طلقة"),
    unitOne: t("shot", "طلقة"),
    image: "shotgun",
    blurb: t("Standing, wide pattern.", "وقوفاً، انتشار واسع."),
  },
  {
    id: "archery",
    name: t("Archery", "القوس والسهم"),
    unit: t("arrows", "سهم"),
    unitOne: t("arrow", "سهم"),
    image: "archery",
    blurb: t("Indoor hall, recurve bows.", "صالة داخلية، أقواس منحنية."),
  },
];

export type Package = {
  id: string;
  /** Rounds, shots or arrows depending on the range. */
  count: number;
  /** Price in fils. */
  price: number;
  active: boolean;
};

export type Firearm = {
  id: string;
  range: RangeId;
  name: string;
  /** Calibre, gauge, or draw weight for a bow. */
  caliber: string;
  image: string;
  /** Off sale without disappearing: the card still shows, marked unavailable. */
  active: boolean;
  packages: Package[];
};

/* [PLACEHOLDER] Representative stock and pricing. Replace both. */
export const firearms: Firearm[] = [
  {
    id: "pistol-01",
    range: "pistol",
    name: "Glock 17",
    caliber: "9x19mm",
    image: "pistol",
    active: true,
    packages: [
      { id: "p1-10", count: 10, price: 5 * KD, active: true },
      { id: "p1-20", count: 20, price: 9 * KD, active: true },
      { id: "p1-30", count: 30, price: 13 * KD, active: true },
    ],
  },
  {
    id: "pistol-02",
    range: "pistol",
    name: "CZ 75 SP-01",
    caliber: "9x19mm",
    image: "pistol",
    active: true,
    packages: [
      { id: "p2-10", count: 10, price: 5 * KD, active: true },
      { id: "p2-20", count: 20, price: 9 * KD, active: true },
      { id: "p2-30", count: 30, price: 13 * KD, active: true },
    ],
  },
  {
    id: "pistol-03",
    range: "pistol",
    name: "S&W 686",
    caliber: ".357 Magnum",
    image: "pistol",
    active: false,
    packages: [
      { id: "p3-10", count: 10, price: 7 * KD, active: true },
      { id: "p3-20", count: 20, price: 12 * KD, active: true },
    ],
  },
  {
    id: "rifle-01",
    range: "rifle",
    name: "Precision Rifle",
    caliber: ".308",
    image: "rifle",
    active: true,
    packages: [
      { id: "r1-5", count: 5, price: 6 * KD, active: true },
      { id: "r1-10", count: 10, price: 10 * KD, active: true },
      { id: "r1-20", count: 20, price: 18 * KD, active: true },
    ],
  },
  {
    id: "rifle-02",
    range: "rifle",
    name: "AR-15",
    caliber: "5.56x45mm",
    image: "rifle",
    active: true,
    packages: [
      { id: "r2-5", count: 5, price: 6 * KD, active: true },
      { id: "r2-10", count: 10, price: 10 * KD, active: true },
      { id: "r2-20", count: 20, price: 18 * KD, active: true },
    ],
  },
  {
    id: "rifle-03",
    range: "rifle",
    name: "CZ 457",
    caliber: ".22 LR",
    image: "rifle",
    active: true,
    packages: [
      { id: "r3-10", count: 10, price: 4 * KD, active: true },
      { id: "r3-20", count: 20, price: 7 * KD, active: true },
    ],
  },
  {
    id: "shotgun-01",
    range: "shotgun",
    name: "Beretta 686",
    caliber: "12 gauge",
    image: "shotgun",
    active: true,
    packages: [
      { id: "s1-5", count: 5, price: 7 * KD, active: true },
      { id: "s1-10", count: 10, price: 12 * KD, active: true },
      { id: "s1-20", count: 20, price: 22 * KD, active: true },
    ],
  },
  {
    id: "shotgun-02",
    range: "shotgun",
    name: "Remington 870",
    caliber: "12 gauge",
    image: "shotgun",
    active: true,
    packages: [
      { id: "s2-5", count: 5, price: 7 * KD, active: true },
      { id: "s2-10", count: 10, price: 12 * KD, active: true },
    ],
  },
  {
    id: "archery-01",
    range: "archery",
    name: "Recurve Bow",
    caliber: "20-30 lb",
    image: "archery",
    active: true,
    packages: [
      { id: "a1-10", count: 10, price: 4 * KD, active: true },
      { id: "a1-20", count: 20, price: 7 * KD, active: true },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* LOYALTY                                                                     */
/* -------------------------------------------------------------------------- */

/* [PLACEHOLDER] One place to change the earn rate. Nothing else computes it. */
export const LOYALTY = {
  /** Points awarded per whole dinar spent. */
  pointsPerKD: 10,
  /** Guests earn nothing until an order is linked to an account. */
  guestsEarn: false,
};

/** Points for an amount in fils. Rounds down: never award part points. */
export function pointsFor(fils: number): number {
  return Math.floor((fils / KD) * LOYALTY.pointsPerKD);
}

/* -------------------------------------------------------------------------- */
/* LOOKUPS                                                                     */
/* -------------------------------------------------------------------------- */

export function getRange(id: string): RangeMeta | undefined {
  return ranges.find((r) => r.id === id);
}

export function firearmsIn(range: RangeId): Firearm[] {
  return firearms.filter((f) => f.range === range);
}

export function getFirearm(id: string): Firearm | undefined {
  return firearms.find((f) => f.id === id);
}

export function getPackage(firearmId: string, packageId: string): Package | undefined {
  return getFirearm(firearmId)?.packages.find((p) => p.id === packageId);
}

/**
 * Prices a line server-side from the catalogue.
 *
 * The browser never states a price. It sends ids and a quantity; the total is
 * recomputed here. Anything else lets a customer set their own price.
 */
export function priceLine(
  firearmId: string,
  packageId: string,
  quantity: number
): { unit: number; total: number } | null {
  const f = getFirearm(firearmId);
  const p = getPackage(firearmId, packageId);
  if (!f || !p || !f.active || !p.active) return null;
  const q = Math.max(1, Math.min(10, Math.floor(quantity)));
  return { unit: p.price, total: p.price * q };
}
