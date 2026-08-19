"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./staff.module.css";

/* Mirrors OrderForStaff. Civil ID arrives as last four only. */
type StaffOrder = {
  id: string;
  orderNumber: string;
  customer: { fullName: string; phone: string; civilIdLast4: string };
  items: { id: string; firearmName: string; caliber: string; count: number; quantity: number }[];
  total: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
  redeemedAt: string | null;
  redeemedBy: string | null;
};

const fmt = (fils: number) => {
  const d = Math.floor(fils / 1000);
  const r = fils % 1000;
  return r === 0 ? `KD ${d}` : `KD ${d}.${String(r).padStart(3, "0").replace(/0+$/, "")}`;
};

const time = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kuwait",
  });

/**
 * The cashier console.
 *
 * Built for one job done many times a day: find the order, confirm it is paid,
 * redeem it. Search covers order number, name, phone and Civil ID so staff can
 * work from whatever the customer offers. Every decision — paid, already
 * redeemed — is made by the server; this screen only reports it.
 */
export default function StaffClient() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [q, setQ] = useState("");
  const [list, setList] = useState<StaffOrder[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const headers = useCallback(
    () => ({ "content-type": "application/json", "x-staff-key": key }),
    [key]
  );

  const load = useCallback(
    async (query = "") => {
      setBusy(true);
      setError(null);
      try {
        const url = query.trim()
          ? `/api/staff/lookup?q=${encodeURIComponent(query.trim())}`
          : "/api/staff/lookup";
        const res = await fetch(url, { headers: headers() });
        if (res.status === 401) {
          setAuthed(false);
          setError("Wrong passcode.");
          return;
        }
        const data = await res.json();
        setAuthed(true);
        setList(data.orders ?? []);
      } catch {
        setError("Connection lost.");
      } finally {
        setBusy(false);
      }
    },
    [headers]
  );

  /* Today's orders refresh quietly while the till is open. */
  useEffect(() => {
    if (!authed) return;
    const id = window.setInterval(() => {
      if (!q.trim()) load();
    }, 20_000);
    return () => window.clearInterval(id);
  }, [authed, q, load]);

  async function redeem(orderId: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/staff/redeem", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === "already_redeemed"
            ? "This order has already been redeemed."
            : data.error === "not_paid"
              ? "This order is not paid."
              : "Could not redeem."
        );
        if (data.order) setList((l) => l.map((o) => (o.id === orderId ? data.order : o)));
        return;
      }
      setList((l) => l.map((o) => (o.id === orderId ? data.order : o)));
    } catch {
      setError("Connection lost.");
    } finally {
      setBusy(false);
      setConfirming(null);
    }
  }

  if (!authed) {
    return (
      <main className={styles.page}>
        <div className={styles.gate}>
          <h1 className={styles.gateTitle}>Staff</h1>
          <label className={styles.label} htmlFor="key">
            Passcode
          </label>
          <input
            id="key"
            className={styles.input}
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            autoComplete="off"
          />
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.primary} onClick={() => load()} disabled={busy}>
            {busy ? "Checking…" : "Enter"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <h1 className={styles.title}>Today&apos;s orders</h1>
          <button className={styles.refresh} onClick={() => load(q)} disabled={busy}>
            {busy ? "…" : "Refresh"}
          </button>
        </div>

        <input
          className={styles.search}
          placeholder="Order number, name, phone or Civil ID"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(q)}
          inputMode="search"
        />

        {error && <p className={styles.error}>{error}</p>}

        {list.length === 0 && !busy && <p className={styles.empty}>No orders.</p>}

        <div className={styles.list}>
          {list.map((o) => {
            const paid = o.paymentStatus === "paid";
            const done = o.status === "redeemed";
            return (
              <article key={o.id} className={styles.order} data-done={done}>
                <div className={styles.orderTop}>
                  <span className={styles.orderNo}>{o.orderNumber}</span>
                  <span className={styles.badges}>
                    <span className={styles.badge} data-tone={paid ? "ok" : "warn"}>
                      {paid ? "Paid" : o.paymentStatus}
                    </span>
                    <span className={styles.badge} data-tone={done ? "done" : "open"}>
                      {done ? "Redeemed" : "Unused"}
                    </span>
                  </span>
                </div>

                <p className={styles.customer}>
                  {o.customer.fullName} · +965 {o.customer.phone} · ID ••••{o.customer.civilIdLast4}
                </p>

                <ul className={styles.items}>
                  {o.items.map((i) => (
                    <li key={i.id}>
                      <strong>{i.firearmName}</strong> — {i.count * i.quantity} rounds
                      <span className={styles.cal}> {i.caliber}</span>
                    </li>
                  ))}
                </ul>

                <div className={styles.orderFoot}>
                  <span className={styles.total}>{fmt(o.total)}</span>
                  <span className={styles.when}>{time(o.createdAt)}</span>
                </div>

                {done ? (
                  <p className={styles.redeemed}>
                    Redeemed {o.redeemedAt ? time(o.redeemedAt) : ""}
                    {o.redeemedBy ? ` · ${o.redeemedBy}` : ""}
                  </p>
                ) : confirming === o.id ? (
                  <div className={styles.confirm}>
                    <span>Hand over {o.items.reduce((s, i) => s + i.count * i.quantity, 0)} rounds?</span>
                    <div className={styles.confirmRow}>
                      <button className={styles.ghost} onClick={() => setConfirming(null)}>
                        Cancel
                      </button>
                      <button className={styles.redeem} onClick={() => redeem(o.id)} disabled={busy}>
                        Confirm
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className={styles.redeem}
                    onClick={() => setConfirming(o.id)}
                    disabled={!paid || busy}
                  >
                    {paid ? "Redeem" : "Not paid"}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
