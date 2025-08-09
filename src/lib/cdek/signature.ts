import { createHash } from "crypto";

type Primitive = string | number | boolean | null;

function flatten(obj: any, prefix = "", out: Record<string, Primitive> = {}): Record<string, Primitive> {
  if (obj === null || obj === undefined) return out;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      flatten(obj[i], `${prefix}${prefix ? "." : ""}${i}`, out);
    }
    return out;
  }
  if (typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      flatten(obj[key], `${prefix}${prefix ? "." : ""}${key}`, out);
    }
    return out;
  }
  out[prefix] = obj as Primitive;
  return out;
}

export function cdekSignature(paymentOrder: Record<string, any>, secret: string): string {
  const flat = flatten(paymentOrder);
  const keys = Object.keys(flat).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const values = keys.map(k => `${flat[k] ?? ""}`);
  const toHash = values.join("|") + "|" + secret;
  const hex = createHash("sha256").update(toHash, "utf8").digest("hex");
  return hex.toUpperCase();
}
