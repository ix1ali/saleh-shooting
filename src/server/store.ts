import "server-only";
import { randomUUID, randomBytes } from "node:crypto";

/* =============================================================================
   SERVER STORE
   -----------------------------------------------------------------------------
   The persistence boundary. Everything the app needs from a database goes
   through `OrderRepository`, so the in-memory implementation below can be
   replaced with Postgres/Supabase without touching a single route handler.

   THIS IMPLEMENTATION IS FOR DEMO ONLY. It is process memory: orders are lost
   on restart and are not shared between serverless instances. It exists so the
   whole journey can be exercised end to end before a database is provisioned.
   See README for the swap.
   ========================================================================== */

export type PaymentMethod = "applepay" | "knet" | "card";
export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled";
export type OrderStatus = "placed" | "redeemed" | "cancelled";

export type OrderItem = {
  id: string;
  firearmId: string;
  firearmName: string;
  range: string;
  caliber: string;
  packageId: string;
  count: number;
  quantity: number;
  unitPrice: number;
  total: number;
  /** Per item so a multi-package order can be redeemed piece by piece later. */
  redeemedAt: string | null;
};

export type Customer = {
  fullName: string;
  phone: string;
  /** Sensitive. Never returned to the browser except to the owning session. */
  civilId: string;
  dateOfBirth: string;
  email?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  /** Unguessable. The QR carries this and nothing else. */
  verificationToken: string;
  customerId: string | null;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  pointsEarned: number;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  redeemedAt: string | null;
  redeemedBy: string | null;
};

/** What is safe to hand to a customer's own browser. */
export type OrderPublic = Omit<Order, "customer" | "verificationToken"> & {
  customer: { fullName: string; phone: string };
  verificationToken: string;
};

/** What a cashier sees. No Civil ID unless they explicitly ask to verify. */
export type OrderForStaff = Omit<Order, "customer" | "verificationToken"> & {
  customer: { fullName: string; phone: string; civilIdLast4: string };
};

export interface OrderRepository {
  create(o: Order): Promise<Order>;
  byId(id: string): Promise<Order | null>;
  byToken(token: string): Promise<Order | null>;
  byNumber(n: string): Promise<Order | null>;
  update(id: string, patch: Partial<Order>): Promise<Order | null>;
  search(q: string): Promise<Order[]>;
  today(): Promise<Order[]>;
}

class MemoryOrderRepository implements OrderRepository {
  private orders = new Map<string, Order>();

  async create(o: Order) {
    this.orders.set(o.id, o);
    return o;
  }
  async byId(id: string) {
    return this.orders.get(id) ?? null;
  }
  async byToken(token: string) {
    for (const o of this.orders.values()) if (o.verificationToken === token) return o;
    return null;
  }
  async byNumber(n: string) {
    const want = n.trim().toUpperCase();
    for (const o of this.orders.values()) if (o.orderNumber.toUpperCase() === want) return o;
    return null;
  }
  async update(id: string, patch: Partial<Order>) {
    const cur = this.orders.get(id);
    if (!cur) return null;
    const next = { ...cur, ...patch };
    this.orders.set(id, next);
    return next;
  }
  async search(q: string) {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return [...this.orders.values()]
      .filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(s) ||
          o.customer.fullName.toLowerCase().includes(s) ||
          o.customer.phone.includes(s) ||
          o.customer.civilId.includes(s)
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 40);
  }
  async today() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return [...this.orders.values()]
      .filter((o) => new Date(o.createdAt) >= start)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

/* Survives dev hot reloads, which would otherwise drop every test order. */
const g = globalThis as unknown as { __sq8Repo?: OrderRepository };
export const orders: OrderRepository = g.__sq8Repo ?? (g.__sq8Repo = new MemoryOrderRepository());

/* -------------------------------------------------------------------------- */
/* Identifiers                                                                 */
/* -------------------------------------------------------------------------- */

export const newId = () => randomUUID();

/** 32 hex characters from a CSPRNG. This is the only thing the QR carries. */
export const newToken = () => randomBytes(16).toString("hex");

/**
 * Human-readable reference, e.g. SS-260820-1042.
 *
 * Deliberately not sequential across the whole system: the trailing group is
 * random, so an order number cannot be used to guess another order or to infer
 * how many rounds the range has sold.
 */
export function newOrderNumber(now = new Date()): string {
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(2);
  const tail = String(randomBytes(2).readUInt16BE(0) % 9000 + 1000);
  return `SS-${dd}${mm}${yy}-${tail}`;
}

/* -------------------------------------------------------------------------- */
/* Projections                                                                 */
/* -------------------------------------------------------------------------- */

export function toPublic(o: Order): OrderPublic {
  const { customer, ...rest } = o;
  return { ...rest, customer: { fullName: customer.fullName, phone: customer.phone } };
}

export function toStaff(o: Order): OrderForStaff {
  const { customer, verificationToken: _t, ...rest } = o;
  return {
    ...rest,
    customer: {
      fullName: customer.fullName,
      phone: customer.phone,
      civilIdLast4: customer.civilId.slice(-4),
    },
  };
}
