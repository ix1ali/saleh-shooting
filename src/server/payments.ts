import "server-only";
import { randomUUID } from "node:crypto";

/* =============================================================================
   PAYMENTS
   -----------------------------------------------------------------------------
   A provider interface with one implementation: a demo provider that simulates
   Apple Pay, KNET and card without touching money. Swapping in a real Kuwaiti
   gateway means writing a second class here — nothing in checkout changes.

   Two rules the demo keeps so the real one can drop in cleanly:
     1. The browser never decides whether a payment succeeded. It asks the
        server to confirm, and the server decides.
     2. Payment state lives with the payment, not with the order form.
   ========================================================================== */

export type PaymentMethod = "applepay" | "knet" | "card";
export type PaymentState = "created" | "authorised" | "failed" | "cancelled";

export type Payment = {
  id: string;
  amount: number;
  method: PaymentMethod;
  state: PaymentState;
  createdAt: string;
  /** Present once the provider has settled it. */
  reference?: string;
  failureReason?: string;
};

export interface PaymentProvider {
  readonly id: string;
  readonly isDemo: boolean;
  createPayment(input: { amount: number; method: PaymentMethod }): Promise<Payment>;
  /** `outcome` exists only so the demo can exercise failure paths. */
  confirmPayment(id: string, outcome?: "success" | "failure" | "cancel"): Promise<Payment>;
  verifyPayment(id: string): Promise<Payment | null>;
}

class DemoPaymentProvider implements PaymentProvider {
  readonly id = "demo";
  readonly isDemo = true;
  private payments = new Map<string, Payment>();

  async createPayment({ amount, method }: { amount: number; method: PaymentMethod }) {
    const p: Payment = {
      id: randomUUID(),
      amount,
      method,
      state: "created",
      createdAt: new Date().toISOString(),
    };
    this.payments.set(p.id, p);
    return p;
  }

  async confirmPayment(id: string, outcome: "success" | "failure" | "cancel" = "success") {
    const p = this.payments.get(id);
    if (!p) throw new Error("payment_not_found");
    if (p.state !== "created") return p; // never settle twice

    /* A short delay so the client shows a real pending state rather than an
       instant success that reads as fake. */
    await new Promise((r) => setTimeout(r, 550));

    if (outcome === "failure") {
      p.state = "failed";
      p.failureReason = "declined_by_issuer";
    } else if (outcome === "cancel") {
      p.state = "cancelled";
    } else {
      p.state = "authorised";
      p.reference = `DEMO-${p.id.slice(0, 8).toUpperCase()}`;
    }
    this.payments.set(id, p);
    return p;
  }

  async verifyPayment(id: string) {
    return this.payments.get(id) ?? null;
  }
}

const g = globalThis as unknown as { __sq8Pay?: PaymentProvider };

/**
 * The active provider.
 *
 * Demo unless a real gateway is configured. When one is, add the class above,
 * select it here on an env var, and everything downstream keeps working.
 */
export const payments: PaymentProvider =
  g.__sq8Pay ?? (g.__sq8Pay = new DemoPaymentProvider());

/** Surfaced to the UI so it can label the checkout honestly. */
export const PAYMENTS_ARE_DEMO = payments.isDemo;
