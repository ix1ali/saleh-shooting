import { NextResponse } from "next/server";
import { z } from "zod";
import { orders, toStaff } from "@/server/store";
import { isStaff, staffActor } from "@/server/staff";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ orderId: z.string().uuid() });

export async function POST(req: Request) {
  if (!isStaff(req)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  let parsed;
  try {
    parsed = Body.safeParse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!parsed.success) return NextResponse.json({ error: "validation_failed" }, { status: 400 });

  const order = await orders.byId(parsed.data.orderId);
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

  /* An unpaid order must never be handed rounds. */
  if (order.paymentStatus !== "paid") {
    return NextResponse.json({ error: "not_paid" }, { status: 409 });
  }
  /* Double redemption is refused by the server, not by hiding the button. */
  if (order.status === "redeemed") {
    return NextResponse.json(
      { error: "already_redeemed", order: toStaff(order) },
      { status: 409 }
    );
  }

  const now = new Date().toISOString();
  const updated = await orders.update(order.id, {
    status: "redeemed",
    redeemedAt: now,
    redeemedBy: staffActor(req),
    items: order.items.map((i) => ({ ...i, redeemedAt: now })),
  });

  return NextResponse.json({ order: updated ? toStaff(updated) : null });
}
