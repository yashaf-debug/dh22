export default function Page() {
  return (
    <section style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>DH22 — Next.js на Cloudflare Pages</h1>
      <p style={{ opacity: 0.8 }}>
        Пайплайн работает: GitHub Actions → build через @cloudflare/next-on-pages → деплой .vercel/output (Production).
      </p>
    </section>
  );
}
