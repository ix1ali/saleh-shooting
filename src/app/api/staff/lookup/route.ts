import { NextResponse } from "next/server";
import { orders, toStaff } from "@/server/store";
import { isStaff } from "@/server/staff";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Find an order by QR token, order number, phone, name or Civil ID. */
export async function GET(req: Request) {
  if (!isStaff(req)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const q = url.searchParams.get("q");

  if (token) {
    const order = await orders.byToken(token);
    return order
      ? NextResponse.json({ orders: [toStaff(order)] })
      : NextResponse.json({ orders: [] });
  }

  if (q && q.trim()) {
    const byNumber = await orders.byNumber(q);
    if (byNumber) return NextResponse.json({ orders: [toStaff(byNumber)] });
    const found = await orders.search(q);
    return NextResponse.json({ orders: found.map(toStaff) });
  }

  const today = await orders.today();
  return NextResponse.json({ orders: today.map(toStaff) });
}
