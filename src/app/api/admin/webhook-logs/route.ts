export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { all } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1] || "";
  if (token !== (process.env.ADMIN_TOKEN || "")) return NextResponse.json([]);
  const rows = await all(
    "SELECT id, created_at, path, headers, body FROM webhook_logs ORDER BY id DESC LIMIT 20"
  );
  return NextResponse.json(rows);
}

