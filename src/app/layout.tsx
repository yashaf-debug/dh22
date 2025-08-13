import './globals.css';
import Link from 'next/link';
import Script from 'next/script';
import type { ReactNode } from 'react';

export const metadata = {
  metadataBase: new URL('https://dh22.ru'),
  title: { default: 'DH22 — женская одежда и аксессуары', template: '%s — DH22' },
  description: 'DH22 — женская одежда и аксессуары. Новинки каждую неделю.',
  alternates: { canonical: 'https://dh22.ru' },
  openGraph: {
    type: 'website',
    url: 'https://dh22.ru',
    siteName: 'DH22',
    title: 'DH22 — женская одежда и аксессуары',
    description: 'Женская одежда, аксессуары и новинки каждую неделю.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@dh22',
    title: 'DH22 — женская одежда и аксессуары',
    description: 'Женская одежда, аксессуары и новинки каждую неделю.',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DH22',
    url: 'https://dh22.ru',
  };

  return (
    <html lang="ru">
      <body className="font-sans">
        <header className="border-b border-black/10">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-6">
            <Link href="/" className="text-2xl tracking-tight">DH22</Link>
            <nav className="flex items-center gap-5">
              <Link className="navlink" href="/new">Новинки</Link>
              <Link className="navlink" href="/womens">Женская одежда</Link>
              <Link className="navlink" href="/accessories">Аксессуары</Link>
              <Link className="navlink" href="/cart">Корзина</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-black/10 mt-16">
          <div className="container mx-auto px-4 py-10 text-sm flex flex-col md:flex-row gap-4 justify-between">
            <div>© {new Date().getFullYear()} DH22</div>
            <div className="opacity-70">Доставка / Возврат / Политика конфиденциальности</div>
          </div>
        </footer>

        {/* Yandex.Metrika 103743080 */}
        <Script id="ym-init" strategy="afterInteractive">{`
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j=0; j<document.scripts.length; j++){ if (document.scripts[j].src===r){return;} }
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);
          })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=103743080', 'ym');
          window.dataLayer = window.dataLayer || [];
          ym(103743080, 'init', { ssr:true, webvisor:true, clickmap:true, ecommerce:'dataLayer', accurateTrackBounce:true, trackLinks:true });
        `}</Script>
        <noscript>
          <div><img src="https://mc.yandex.ru/watch/103743080" style={{position:'absolute',left:'-9999px'}} alt="" /></div>
        </noscript>

        {/* Organization JSON-LD */}
        <Script id="org-ld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(orgLd)}
        </Script>
      </body>
    </html>
  );
}
