// Edge-совместимая подпись: SHA-256(hex upper) по правилам CDEK
function flatten(obj: any, prefix = "", out: Record<string, string | number | boolean | null> = {}) {
  if (obj === null || obj === undefined) return out;
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => flatten(v, `${prefix}${prefix ? "." : ""}${i}`, out));
    return out;
  }
  if (typeof obj === "object") {
    for (const k of Object.keys(obj)) flatten((obj as any)[k], `${prefix}${prefix ? "." : ""}${k}`, out);
    return out;
  }
  out[prefix] = obj as any;
  return out;
}

async function sha256HexUpper(data: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(data));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export async function cdekSignature(paymentOrder: Record<string, any>, secret: string): Promise<string> {
  const flat = flatten(paymentOrder);
  const keys = Object.keys(flat).sort();
  const values = keys.map(k => `${flat[k] ?? ""}`);
  const toHash = values.join("|") + "|" + secret;
  return await sha256HexUpper(toHash);
}
