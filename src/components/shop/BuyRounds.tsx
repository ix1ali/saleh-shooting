"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion, useIsoLayoutEffect } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { useCart } from "@/lib/cart";
import {
  firearmsIn,
  formatKD,
  getFirearm,
  ranges,
  type Firearm,
  type Package,
  type RangeId,
} from "@/data/catalogue";
import { shop } from "@/data/site";
import Photo from "@/components/visual/Photo";
import styles from "./BuyRounds.module.css";

/**
 * The shop.
 *
 * One decision at a time: range, then firearm, then package. Each step only
 * appears once the one before it is answered, so the section is short on
 * arrival and never presents a wall of products.
 *
 * Prices come from the catalogue and are shown for information. The server
 * re-prices every line when the order is placed.
 */
export default function BuyRounds() {
  const { T, locale } = useLocale();
  const cart = useCart();

  const [range, setRange] = useState<RangeId | null>(null);
  const [firearmId, setFirearmId] = useState<string | null>(null);
  const [packageId, setPackageId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const gunsRef = useRef<HTMLDivElement | null>(null);
  const packsRef = useRef<HTMLDivElement | null>(null);

  /* Deep link from a range panel: #buy?range=rifle opens pre-filtered. */
  useEffect(() => {
    const apply = () => {
      const m = /[?&]range=(pistol|rifle|shotgun|archery)/.exec(window.location.hash);
      if (m) {
        setRange(m[1] as RangeId);
        setFirearmId(null);
        setPackageId(null);
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const guns = useMemo(() => (range ? firearmsIn(range) : []), [range]);
  const firearm = firearmId ? getFirearm(firearmId) : undefined;
  const packs = firearm?.packages.filter((p) => p.active) ?? [];
  const pack = packs.find((p) => p.id === packageId);
  const rangeMeta = ranges.find((r) => r.id === range);

  /* Each step slides in once, quickly. Nothing here should feel cinematic. */
  useIsoLayoutEffect(() => {
    if (!gunsRef.current || prefersReducedMotion()) return;
    gsap.fromTo(
      gunsRef.current.querySelectorAll("[data-gun]"),
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.035, ease: "power3.out" }
    );
  }, [range]);

  useIsoLayoutEffect(() => {
    if (!packsRef.current || prefersReducedMotion()) return;
    gsap.fromTo(
      packsRef.current.querySelectorAll("[data-pack]"),
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.04, ease: "power3.out" }
    );
  }, [firearmId]);

  const cheapest = (f: Firearm) =>
    Math.min(...f.packages.filter((p) => p.active).map((p) => p.price));

  const rangeFrom = (id: RangeId) => {
    const list = firearmsIn(id).filter((f) => f.active);
    return list.length ? Math.min(...list.map(cheapest)) : null;
  };

  const justAdded =
    firearmId && packageId && cart.lastAdded === `${firearmId}:${packageId}`;

  return (
    <section id="buy" className={styles.section} data-section="buy" data-paper="true">
      <span className={styles.label}>{T(shop.label)}</span>
      <h2 className={styles.heading}>{T(shop.heading)}</h2>

      {/* ---- 01 Range ---- */}
      <div className={styles.step}>
        <div className={styles.stepHead}>
          <span className={styles.stepNum}>01</span>
          <span className={styles.stepTitle}>{T(shop.stepRange)}</span>
        </div>
        <div className={styles.ranges}>
          {ranges.map((r) => {
            const from = rangeFrom(r.id);
            return (
              <button
                key={r.id}
                type="button"
                className={styles.range}
                data-selected={range === r.id}
                onClick={() => {
                  setRange(r.id);
                  setFirearmId(null);
                  setPackageId(null);
                }}
              >
                <span className={styles.rangeMedia}>
                  <Photo name={r.image} alt="" grade="none" mono />
                </span>
                <span className={styles.rangeTint} aria-hidden="true" />
                <span className={styles.rangeBody}>
                  <span className={styles.rangeName}>{T(r.name)}</span>
                  {from !== null && (
                    <span className={styles.rangeFrom}>
                      {T(shop.from)} {formatKD(from)}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- 02 Firearm ---- */}
      {range && (
        <div className={styles.step} ref={gunsRef}>
          <div className={styles.stepHead}>
            <span className={styles.stepNum}>02</span>
            <span className={styles.stepTitle}>{T(shop.stepGun)}</span>
            <button type="button" className={styles.stepBack} onClick={() => setRange(null)}>
              {T(shop.change)}
            </button>
          </div>
          <div className={styles.guns}>
            {guns.map((f) => (
              <button
                key={f.id}
                type="button"
                data-gun
                className={styles.gun}
                data-selected={firearmId === f.id}
                data-unavailable={!f.active}
                disabled={!f.active}
                onClick={() => {
                  setFirearmId(f.id);
                  setPackageId(null);
                  setQty(1);
                }}
              >
                <span className={styles.gunMedia}>
                  <Photo name={f.image} alt="" grade="none" mono />
                </span>
                <span>
                  <span className={styles.gunName}>{f.name}</span>
                  <span className={styles.gunMeta}>{f.caliber}</span>
                  {!f.active && (
                    <span className={styles.unavailable}>{T(shop.unavailable)}</span>
                  )}
                </span>
                <span className={styles.gunFrom}>
                  {f.active ? `${T(shop.from)} ${formatKD(cheapest(f))}` : ""}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- 03 Package ---- */}
      {firearm && (
        <div className={styles.step} ref={packsRef}>
          <div className={styles.stepHead}>
            <span className={styles.stepNum}>03</span>
            <span className={styles.stepTitle}>{T(shop.stepRounds)}</span>
            <button type="button" className={styles.stepBack} onClick={() => setFirearmId(null)}>
              {T(shop.change)}
            </button>
          </div>
          <div className={styles.packs}>
            {packs.map((p) => (
              <PackageRow
                key={p.id}
                pack={p}
                unit={rangeMeta ? T(rangeMeta.unit) : ""}
                selected={packageId === p.id}
                onSelect={() => {
                  setPackageId(p.id);
                  setQty(1);
                }}
              />
            ))}
          </div>

          <div className={styles.addRow}>
            <div className={styles.qty}>
              <button
                type="button"
                className={styles.qtyBtn}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label={T(shop.decrease)}
              >
                −
              </button>
              <span className={styles.qtyValue}>{qty}</span>
              <button
                type="button"
                className={styles.qtyBtn}
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                disabled={qty >= 10}
                aria-label={T(shop.increase)}
              >
                +
              </button>
            </div>
            <button
              type="button"
              className={styles.add}
              disabled={!pack}
              onClick={() => {
                if (!firearm || !pack) return;
                cart.add({ firearmId: firearm.id, packageId: pack.id, quantity: qty });
              }}
            >
              {pack ? `${T(shop.add)} · ${formatKD(pack.price * qty)}` : T(shop.pickRounds)}
            </button>
          </div>

          <p className={styles.added} role="status" aria-live="polite">
            {justAdded ? T(shop.addedToCart) : ""}
          </p>
        </div>
      )}
    </section>
  );
}

/** One package. The count is drawn, not described. */
function PackageRow({
  pack,
  unit,
  selected,
  onSelect,
}: {
  pack: Package;
  unit: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const marks = useRef<HTMLSpanElement | null>(null);

  /* The tally grows in when the package is chosen, so changing package reads
     as the count changing rather than a new block appearing. */
  useIsoLayoutEffect(() => {
    if (!selected || !marks.current || prefersReducedMotion()) return;
    gsap.fromTo(
      marks.current.children,
      { scaleY: 0 },
      { scaleY: 1, duration: 0.3, stagger: 0.012, ease: "power3.out" }
    );
  }, [selected]);

  return (
    <button
      type="button"
      data-pack
      className={styles.pack}
      data-selected={selected}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className={styles.packTop}>
        <span className={styles.packCount}>
          {pack.count} {unit}
        </span>
        <span className={styles.packPrice}>{formatKD(pack.price)}</span>
      </span>
      <span className={styles.tally} ref={marks} aria-hidden="true">
        {Array.from({ length: pack.count }).map((_, i) => (
          <span key={i} className={styles.mark} data-five={(i + 1) % 5 === 0} />
        ))}
      </span>
    </button>
  );
}
