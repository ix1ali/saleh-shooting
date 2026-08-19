import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getFirearm,
  getPackage,
  getRange,
  pointsFor,
  priceLine,
} from "@/data/catalogue";
import {
  newId,
  newOrderNumber,
  newToken,
  orders,
  toPublic,
  type Order,
  type OrderItem,
} from "@/server/store";
import { payments } from "@/server/payments";

export const runtime = "nodejs";
/* Orders are per-request state; nothing here may be cached. */
export const dynamic = "force-dynamic";

/* The browser sends ids and quantities only. It never sends a price. */
const Body = z.object({
  items: z
    .array(
      z.object({
        firearmId: z.string().min(1).max(64),
        packageId: z.string().min(1).max(64),
        quantity: z.number().int().min(1).max(10),
      })
    )
    .min(1)
    .max(12),
  customer: z.object({
    fullName: z.string().trim().min(2).max(80),
    /* Kuwaiti mobile, with or without the country code. */
    phone: z.string().trim().regex(/^(?:\+?965)?[0-9]{8}$/),
    /* Kuwaiti Civil ID is 12 digits. Format only — no registry lookup. */
    civilId: z.string().trim().regex(/^[0-9]{12}$/),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    email: z.string().trim().email().max(120).optional().or(z.literal("")),
  }),
  method: z.enum(["applepay", "knet", "card"]),
});

/** Age on a given day, from a date of birth. */
function ageOn(dob: string, on = new Date()): number {
  const d = new Date(dob + "T00:00:00Z");
  let age = on.getUTCFullYear() - d.getUTCFullYear();
  const m = on.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && on.getUTCDate() < d.getUTCDate())) age -= 1;
  return age;
}

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = Body.safeParse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }
  const { items, customer, method } = parsed.data;

  if (!Number.isFinite(ageOn(customer.dateOfBirth)) || ageOn(customer.dateOfBirth) < 0) {
    return NextResponse.json({ error: "invalid_dob" }, { status: 400 });
  }

  /* Price every line from the catalogue. A client-supplied total is never
     trusted, and an item that went off sale between browsing and paying is
     rejected here rather than sold. */
  const priced: OrderItem[] = [];
  for (const line of items) {
    const firearm = getFirearm(line.firearmId);
    const pack = getPackage(line.firearmId, line.packageId);
    const money = priceLine(line.firearmId, line.packageId, line.quantity);
    if (!firearm || !pack || !money) {
      return NextResponse.json(
        { error: "item_unavailable", firearmId: line.firearmId },
        { status: 409 }
      );
    }
    priced.push({
      id: newId(),
      firearmId: firearm.id,
      firearmName: firearm.name,
      range: getRange(firearm.range)?.id ?? firearm.range,
      caliber: firearm.caliber,
      packageId: pack.id,
      count: pack.count,
      quantity: line.quantity,
      unitPrice: money.unit,
      total: money.total,
      redeemedAt: null,
    });
  }

  const subtotal = priced.reduce((s, i) => s + i.total, 0);
  const discount = 0; // rewards land here once the loyalty ledger exists
  const total = subtotal - discount;

  const payment = await payments.createPayment({ amount: total, method });

  const order: Order = {
    id: newId(),
    orderNumber: newOrderNumber(),
    verificationToken: newToken(),
    customerId: null, // guest
    customer,
    items: priced,
    subtotal,
    discount,
    total,
    pointsEarned: pointsFor(total),
    paymentMethod: method,
    paymentStatus: "pending",
    status: "placed",
    createdAt: new Date().toISOString(),
    redeemedAt: null,
    redeemedBy: null,
  };
  await orders.create(order);

  return NextResponse.json({
    order: toPublic(order),
    paymentId: payment.id,
    demo: payments.isDemo,
  });
}
