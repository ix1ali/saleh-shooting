"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion, useIsoLayoutEffect } from "@/lib/motion";
import { useLocale } from "@/lib/locale";
import { useCart } from "@/lib/cart";
import { formatKD } from "@/data/catalogue";
import { shop } from "@/data/site";
import styles from "./CartBar.module.css";

/** The compact cart. Only present when the cart is not empty. */
export default function CartBar() {
  const { T } = useLocale();
  const cart = useCart();
  const bar = useRef<HTMLDivElement | null>(null);

  useIsoLayoutEffect(() => {
    const el = bar.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { yPercent: cart.count ? 0 : 120 });
      return;
    }
    gsap.to(el, {
      yPercent: cart.count ? 0 : 120,
      duration: 0.42,
      ease: "power3.out",
      overwrite: true,
    });
  }, [cart.count]);

  return (
    <div ref={bar} className={styles.bar} style={{ transform: "translateY(120%)" }}>
      <span className={styles.summary}>
        <span className={styles.count}>
          {cart.count} {T(cart.count === 1 ? shop.item : shop.items)}
        </span>
        <span className={styles.total}>{formatKD(cart.subtotal)}</span>
      </span>
      <a className={styles.go} href="/checkout">
        {T(shop.checkout)}
      </a>
    </div>
  );
}
