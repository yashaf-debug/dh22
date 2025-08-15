export interface Env {
  TURNSTILE_SECRET?: string;
  TURNSTILE_STRICT?: string; // "1" to enforce strict validation
}

export async function verifyTurnstile(env: Env, token: string | undefined, ip: string | null) {
  if (!env.TURNSTILE_SECRET) return { ok: true, reason: "no-secret" };
  if (!token) return { ok: env.TURNSTILE_STRICT !== "1", reason: "no-token" };

  const form = new URLSearchParams();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  const data = await r.json().catch(() => ({}));
  const ok = !!data.success;
  return { ok, reason: ok ? "ok" : "verify-failed", raw: data };
}

