import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { orders } from "@/server/store";
import { formatKD } from "@/data/catalogue";
import styles from "./order.module.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your order — Shooting Complex",
  /* An order page must never be indexed or sent to a referrer. */
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

/**
 * Order confirmation.
 *
 * Rendered on the server and guarded by the verification token, so the order id
 * alone is not enough to read someone else's purchase. The QR encodes only the
 * token — no name, phone, Civil ID or order contents travel in the image.
 */
export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  const { t } = await searchParams;

  const order = await orders.byId(id);
  if (!order || !t || order.verificationToken !== t) notFound();

  const qr = await QRCode.toString(`SQ8:${order.verificationToken}`, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    color: { dark: "#0B1220", light: "#FFFFFF" },
  });

  const paid = order.paymentStatus === "paid";
  const totalRounds = order.items.reduce((s, i) => s + i.count * i.quantity, 0);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.mark} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12.5 L9.5 18 L20 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className={styles.title}>
          {paid ? "You're ready to shoot" : "Order created"}
        </h1>
        <p className={styles.number}>Order {order.orderNumber}</p>

        <div className={styles.qrWrap}>
          <div className={styles.qr} dangerouslySetInnerHTML={{ __html: qr }} />
          <p className={styles.qrLabel}>Show this at the cashier</p>
        </div>

        <section className={styles.block}>
          {order.items.map((i) => (
            <div key={i.id} className={styles.line}>
              <span className={styles.lineMain}>
                <span className={styles.lineName}>{i.firearmName}</span>
                <span className={styles.lineMeta}>
                  {i.count} × {i.quantity > 1 ? `${i.quantity} packages` : "1 package"} · {i.caliber}
                </span>
              </span>
              <span className={styles.linePrice}>{formatKD(i.total)}</span>
            </div>
          ))}
          <div className={styles.totalRow}>
            <span>Total · {totalRounds} rounds</span>
            <span className={styles.totalValue}>{formatKD(order.total)}</span>
          </div>
        </section>

        <dl className={styles.meta}>
          <div><dt>Status</dt><dd data-ok={paid}>{paid ? "Paid" : order.paymentStatus}</dd></div>
          <div><dt>Redemption</dt><dd>{order.status === "redeemed" ? "Redeemed" : "Unused"}</dd></div>
          <div><dt>Name</dt><dd>{order.customer.fullName}</dd></div>
        </dl>

        <p className={styles.demo}>
          Demo mode — no real payment was taken.
        </p>

        <a className={styles.home} href="/">Back to the site</a>
      </div>
    </main>
  );
}
