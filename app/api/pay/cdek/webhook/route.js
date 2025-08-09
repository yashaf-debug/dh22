export const runtime = "edge";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { first, run } from "../../../../lib/db";
import { byNumber, markStatus } from "../../../../lib/sql";

async function hmacOk(secret, raw, got) {
  if (!secret) return true; // если секрет не задан — принимаем (настрой позже)
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), {name:"HMAC", hash:"SHA-256"}, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(raw));
  const hex = Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,"0")).join("");
  return (got || "").toLowerCase() === hex;
}

export async function POST(req) {
  const { env } = getRequestContext();
  const raw = await req.text();
  const ok = await hmacOk(env.CDEK_PAY_SIGN_SECRET || "", raw, req.headers.get("x-signature"));
  if (!ok) return new Response("bad signature", { status: 401 });

  let data = {};
  try { data = JSON.parse(raw); } catch {}
  // предполагаемые поля (уточни по вашему аккаунту CDEK Pay):
  // { order_id: "DH22-...", status: "paid" | "failed" | "refunded", payment_id: "..." }
  const orderNumber = data.order_id || data.merchant_order_id;
  if (!orderNumber) return new Response("no order_id", { status: 400 });

  const order = await first(byNumber, orderNumber);
  if (!order) return new Response("no order", { status: 404 });

  const status = (data.status || "").toLowerCase();
  if (status === "paid" || status === "success") {
    await run(markStatus, "paid", order.id);
  } else if (status === "failed" || status === "canceled" || status === "cancelled") {
    await run(markStatus, "failed", order.id);
  }
  return new Response("ok");
}
