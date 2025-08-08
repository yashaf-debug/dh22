export const metadata = {
  title: "DH22 — Next.js",
  description: "Минимальный старт на Next.js + Cloudflare Pages"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body style={{ fontFamily: "ui-sans-serif, system-ui, Helvetica, Arial", margin: 0 }}>
        <header style={{ borderBottom: "1px solid #e5e5e5", padding: "12px 16px" }}>
          <strong>DH22</strong>
        </header>
        <main>{children}</main>
        <footer style={{ borderTop: "1px solid #e5e5e5", padding: "24px 16px", fontSize: 12, opacity: 0.7 }}>
          © {new Date().getFullYear()} DH22
        </footer>
      </body>
    </html>
  );
}
