import { NextResponse } from "next/server";
import { orders, toPublic } from "@/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A customer reading back their own order.
 *
 * Guarded by the verification token rather than the id alone: the id appears in
 * the confirmation URL, and an id on its own must not be enough to read someone
 * else's order. Civil ID is never included in the response.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = new URL(req.url).searchParams.get("t");
  if (!token) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const order = await orders.byId(id);
  if (!order || order.verificationToken !== token) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ order: toPublic(order) });
}
