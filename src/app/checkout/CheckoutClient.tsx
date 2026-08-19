"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale";
import { describeLine, useCart } from "@/lib/cart";
import { formatKD, pointsFor } from "@/data/catalogue";
import { checkout as copy, shop } from "@/data/site";
import styles from "./checkout.module.css";

type Method = "applepay" | "knet" | "card";

type Fields = {
  fullName: string;
  phone: string;
  civilId: string;
  dateOfBirth: string;
  email: string;
};

const EMPTY: Fields = { fullName: "", phone: "", civilId: "", dateOfBirth: "", email: "" };

/**
 * Checkout.
 *
 * Deliberately calm: no scroll animation, no cinematic type. The hero is where
 * this site performs; this is where it has to be trusted. One column, visible
 * labels, native keyboards, and a summary that always shows what will be
 * charged before anything is charged.
 */
export default function CheckoutClient() {
  const { T } = useLocale();
  const cart = useCart();
  const router = useRouter();

  const [mode, setMode] = useState<"choose" | "guest">("choose");
  const [f, setF] = useState<Fields>(EMPTY);
  const [method, setMethod] = useState<Method>("applepay");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const lines = useMemo(
    () => cart.lines.map((l) => ({ line: l, info: describeLine(l) })).filter((x) => x.info),
    [cart.lines]
  );

  const digits = (v: string) => v.replace(/\D/g, "");

  const errors = useMemo(() => {
    const e: Partial<Record<keyof Fields, string>> = {};
    if (f.fullName.trim().length < 2) e.fullName = T(copy.errName);
    if (!/^[0-9]{8}$/.test(digits(f.phone))) e.phone = T(copy.errPhone);
    if (!/^[0-9]{12}$/.test(digits(f.civilId))) e.civilId = T(copy.errCivilId);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.dateOfBirth)) e.dateOfBirth = T(copy.errDob);
    if (f.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = T(copy.errEmail);
    return e;
  }, [f, T]);

  const valid = Object.keys(errors).length === 0 && lines.length > 0;

  async function pay() {
    setTouched(true);
    if (!valid || busy) return;
    setBusy(true);
    setError(null);

    try {
      /* The server prices the order from the catalogue. Nothing about money is
         sent from here. */
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: cart.lines,
          customer: {
            fullName: f.fullName.trim(),
            phone: digits(f.phone),
            civilId: digits(f.civilId),
            dateOfBirth: f.dateOfBirth,
            email: f.email.trim() || undefined,
          },
          method,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === "item_unavailable" ? T(copy.errUnavailable) : T(copy.errOrder)
        );
        setBusy(false);
        return;
      }

      /* The server decides whether payment succeeded, not this component. */
      const confirm = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: data.order.id, paymentId: data.paymentId }),
      });
      const result = await confirm.json();

      if (!confirm.ok) {
        setError(
          result.error === "payment_cancelled" ? T(copy.errCancelled) : T(copy.errPayment)
        );
        setBusy(false);
        return;
      }

      cart.clear();
      router.push(`/order/${result.order.id}?t=${result.order.verificationToken}`);
    } catch {
      setError(T(copy.errNetwork));
      setBusy(false);
    }
  }

  if (lines.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <h1 className={styles.title}>{T(copy.title)}</h1>
          <p className={styles.empty}>{T(shop.emptyCart)}</p>
          <a className={styles.backLink} href="/#buy">
            {T(shop.buyRounds)}
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <a className={styles.back} href="/#buy">
          {T(copy.back)}
        </a>
        <h1 className={styles.title}>{T(copy.title)}</h1>
        <p className={styles.demo}>{T(shop.demoNotice)}</p>

        {/* ---- Summary ---- */}
        <section className={styles.block} aria-labelledby="sum">
          <h2 id="sum" className={styles.blockTitle}>
            {T(shop.cartTitle)}
          </h2>
          {lines.map(({ line, info }) => (
            <div key={`${line.firearmId}:${line.packageId}`} className={styles.line}>
              <span className={styles.lineMain}>
                <span className={styles.lineName}>{info!.firearm.name}</span>
                <span className={styles.lineMeta}>
                  {info!.pack.count} {info!.range ? T(info!.range.unit) : ""}
                  {line.quantity > 1 ? ` × ${line.quantity}` : ""}
                </span>
              </span>
              <span className={styles.linePrice}>{formatKD(info!.total)}</span>
              <button
                type="button"
                className={styles.lineRemove}
                onClick={() => cart.remove(line.firearmId, line.packageId)}
                aria-label={`${T(shop.remove)} ${info!.firearm.name}`}
              >
                ×
              </button>
            </div>
          ))}
          <div className={styles.totalRow}>
            <span>{T(shop.total)}</span>
            <span className={styles.totalValue}>{formatKD(cart.subtotal)}</span>
          </div>
          <p className={styles.points}>
            {T(copy.pointsHint).replace("{n}", String(pointsFor(cart.subtotal)))}
          </p>
        </section>

        {/* ---- Guest or account ---- */}
        {mode === "choose" ? (
          <section className={styles.block}>
            <h2 className={styles.blockTitle}>{T(copy.howTitle)}</h2>
            <button type="button" className={styles.primary} onClick={() => setMode("guest")}>
              {T(copy.guest)}
            </button>
            <p className={styles.accountNote}>{T(copy.accountSoon)}</p>
          </section>
        ) : (
          <>
            {/* ---- Details ---- */}
            <section className={styles.block}>
              <h2 className={styles.blockTitle}>{T(copy.detailsTitle)}</h2>

              <Field
                id="fullName"
                label={T(copy.fullName)}
                value={f.fullName}
                onChange={(v) => setF({ ...f, fullName: v })}
                error={touched ? errors.fullName : undefined}
                autoComplete="name"
              />
              <Field
                id="phone"
                label={T(copy.phone)}
                value={f.phone}
                onChange={(v) => setF({ ...f, phone: digits(v).slice(0, 8) })}
                error={touched ? errors.phone : undefined}
                inputMode="numeric"
                type="tel"
                autoComplete="tel"
                prefix="+965"
              />
              <Field
                id="civilId"
                label={T(copy.civilId)}
                value={f.civilId}
                onChange={(v) => setF({ ...f, civilId: digits(v).slice(0, 12) })}
                error={touched ? errors.civilId : undefined}
                inputMode="numeric"
                hint={T(copy.civilIdHint)}
              />
              <Field
                id="dob"
                label={T(copy.dob)}
                value={f.dateOfBirth}
                onChange={(v) => setF({ ...f, dateOfBirth: v })}
                error={touched ? errors.dateOfBirth : undefined}
                type="date"
              />
              <Field
                id="email"
                label={T(copy.email)}
                value={f.email}
                onChange={(v) => setF({ ...f, email: v })}
                error={touched ? errors.email : undefined}
                type="email"
                autoComplete="email"
                optional={T(copy.optional)}
              />
            </section>

            {/* ---- Payment ---- */}
            <section className={styles.block}>
              <h2 className={styles.blockTitle}>{T(copy.payTitle)}</h2>
              <div className={styles.methods}>
                {(
                  [
                    ["applepay", T(copy.applePay)],
                    ["knet", "KNET"],
                    ["card", T(copy.card)],
                  ] as [Method, string][]
                ).map(([id, name]) => (
                  <button
                    key={id}
                    type="button"
                    className={styles.method}
                    data-selected={method === id}
                    onClick={() => setMethod(id)}
                    aria-pressed={method === id}
                  >
                    <span>{name}</span>
                    <span className={styles.demoTag}>{T(copy.demoTag)}</span>
                  </button>
                ))}
              </div>

              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}

              <button
                type="button"
                className={styles.pay}
                onClick={pay}
                disabled={busy}
                data-busy={busy}
              >
                {busy ? T(copy.processing) : `${T(copy.pay)} · ${formatKD(cart.subtotal)}`}
              </button>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  optional,
  prefix,
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  optional?: string;
  prefix?: string;
  /* Omit the native onChange: this component hands back the value, not the
     event, so callers cannot accidentally use the wrong one. */
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "id">) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {optional && <span className={styles.optional}> {optional}</span>}
      </label>
      <div className={styles.inputWrap} data-error={!!error}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <input
          id={id}
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
          {...rest}
        />
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className={styles.fieldError}>
          {error}
        </p>
      )}
    </div>
  );
}
