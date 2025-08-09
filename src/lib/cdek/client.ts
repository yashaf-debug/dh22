export type CdekLinkResponse = { link: string; order_id: number; access_key: string };

export async function createCdekPaymentLink(payload: any): Promise<CdekLinkResponse> {
  const base = process.env.CDEK_PAY_BASE || "https://secure.cdekfin.ru";
  const res = await fetch(`${base}/merchant_api/payment_orders`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CDEK_PAY_HTTP_${res.status}: ${text}`);
  }
  return res.json() as Promise<CdekLinkResponse>;
}
