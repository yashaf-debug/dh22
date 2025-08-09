import { getRequestContext } from "@cloudflare/next-on-pages";

export async function tgSend(text: string) {
  const { env } = getRequestContext();
  const token = env.TELEGRAM_BOT_TOKEN;
  const chat  = env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return { ok: false, skipped: true };

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chat,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true
    })
  });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}
