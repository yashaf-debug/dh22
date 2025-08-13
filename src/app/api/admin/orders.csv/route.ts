export const runtime = "edge";
import { NextRequest } from "next/server";
import { all } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1] || "";
  if (token !== (process.env.ADMIN_TOKEN || "")) {
    return new Response("forbidden", { status: 403 });
  }
  const rows = await all("SELECT number, status, payment_method, customer_name, customer_phone, customer_email, amount_total, created_at FROM orders ORDER BY id DESC LIMIT 1000");

  const head = ["number","status","payment_method","customer_name","customer_phone","customer_email","amount_total_rub","created_at"];
  const lines = [head.join(",")].concat(
    rows.map((r:any)=>[
      r.number,
      r.status,
      r.payment_method,
      `"${(r.customer_name||"").replace(/"/g,'""')}"`,
      `"${(r.customer_phone||"").replace(/"/g,'""')}"`,
      `"${(r.customer_email||"").replace(/"/g,'""')}"`,
      (r.amount_total/100).toFixed(2),
      r.created_at
    ].join(","))
  );
  const csv = lines.join("\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="orders.csv"`
    }
  });
}
