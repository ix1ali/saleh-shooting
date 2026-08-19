import { NextResponse } from "next/server";
import { z } from "zod";
import { orders, toPublic } from "@/server/store";
import { payments } from "@/server/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  orderId: z.string().uuid(),
  paymentId: z.string().uuid(),
  /* Demo only: lets the journey exercise decline and cancel paths. Ignored by
     a real provider, which decides the outcome itself. */
  outcome: z.enum(["success", "failure", "cancel"]).optional(),
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = Body.safeParse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!parsed.success) return NextResponse.json({ error: "validation_failed" }, { status: 400 });

  const { orderId, paymentId, outcome } = parsed.data;

  const order = await orders.byId(orderId);
  if (!order) return NextResponse.json({ error: "order_not_found" }, { status: 404 });
  if (order.paymentStatus === "paid") {
    /* Idempotent: a retried confirm must not create a second payment. */
    return NextResponse.json({ order: toPublic(order) });
  }

  const payment = await payments.confirmPayment(paymentId, outcome);

  /* The server decides. The browser saying it paid means nothing. */
  if (payment.state !== "authorised") {
    const failed = await orders.update(orderId, {
      paymentStatus: payment.state === "cancelled" ? "cancelled" : "failed",
    });
    return NextResponse.json(
      { error: payment.state === "cancelled" ? "payment_cancelled" : "payment_failed",
        reason: payment.failureReason ?? null,
        order: failed ? toPublic(failed) : null },
      { status: 402 }
    );
  }

  if (payment.amount !== order.total) {
    return NextResponse.json({ error: "amount_mismatch" }, { status: 409 });
  }

  const paid = await orders.update(orderId, { paymentStatus: "paid" });
  return NextResponse.json({ order: paid ? toPublic(paid) : null });
}
