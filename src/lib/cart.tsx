"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getFirearm, getPackage, getRange, pointsFor } from "@/data/catalogue";

/* =============================================================================
   CART
   -----------------------------------------------------------------------------
   Holds ids and quantities only. Prices shown here are read from the catalogue
   for display; the server re-prices every line at checkout, so a tampered cart
   cannot change what is charged.

   Persisted to sessionStorage so a refresh mid-purchase does not lose the
   basket. Nothing sensitive is ever written there — no name, phone or Civil ID.
   ========================================================================== */

export type CartLine = {
  firearmId: string;
  packageId: string;
  quantity: number;
};

type CartCtx = {
  lines: CartLine[];
  add: (line: CartLine) => void;
  setQuantity: (firearmId: string, packageId: string, quantity: number) => void;
  remove: (firearmId: string, packageId: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  points: number;
  /** Set briefly after an add, so the UI can acknowledge it without a toast. */
  lastAdded: string | null;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "sq8:cart";
const MAX_QTY = 10;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* Corrupt or unavailable storage: start empty rather than crash. */
    }
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* Private mode. The cart simply does not survive a refresh. */
    }
  }, [lines]);

  const add = useCallback((line: CartLine) => {
    setLines((cur) => {
      const i = cur.findIndex(
        (l) => l.firearmId === line.firearmId && l.packageId === line.packageId
      );
      if (i === -1) return [...cur, { ...line, quantity: Math.min(MAX_QTY, line.quantity) }];
      const next = [...cur];
      next[i] = { ...next[i], quantity: Math.min(MAX_QTY, next[i].quantity + line.quantity) };
      return next;
    });
    const key = `${line.firearmId}:${line.packageId}`;
    setLastAdded(key);
    window.setTimeout(() => setLastAdded((k) => (k === key ? null : k)), 2200);
  }, []);

  const setQuantity = useCallback((firearmId: string, packageId: string, quantity: number) => {
    setLines((cur) =>
      quantity <= 0
        ? cur.filter((l) => !(l.firearmId === firearmId && l.packageId === packageId))
        : cur.map((l) =>
            l.firearmId === firearmId && l.packageId === packageId
              ? { ...l, quantity: Math.min(MAX_QTY, quantity) }
              : l
          )
    );
  }, []);

  const remove = useCallback((firearmId: string, packageId: string) => {
    setLines((cur) => cur.filter((l) => !(l.firearmId === firearmId && l.packageId === packageId)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const { count, subtotal } = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    for (const l of lines) {
      const pack = getPackage(l.firearmId, l.packageId);
      if (!pack) continue;
      count += l.quantity;
      subtotal += pack.price * l.quantity;
    }
    return { count, subtotal };
  }, [lines]);

  const value = useMemo<CartCtx>(
    () => ({
      lines,
      add,
      setQuantity,
      remove,
      clear,
      count,
      subtotal,
      points: pointsFor(subtotal),
      lastAdded,
    }),
    [lines, add, setQuantity, remove, clear, count, subtotal, lastAdded]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside <CartProvider>");
  return c;
}

/** Expands a stored line into everything the UI needs to render it. */
export function describeLine(line: CartLine) {
  const firearm = getFirearm(line.firearmId);
  const pack = getPackage(line.firearmId, line.packageId);
  if (!firearm || !pack) return null;
  const range = getRange(firearm.range);
  return { firearm, pack, range, total: pack.price * line.quantity };
}
