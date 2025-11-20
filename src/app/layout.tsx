import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Suspense, type ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RootLayoutClient from "./RootLayoutClient";
import {
  DEFAULT_METADATA,
  organizationJsonLd,
  siteNavJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = DEFAULT_METADATA;

export default function RootLayout({ children }: { children: ReactNode }) {
  const SHOW_CHROME = false;

  return (
    <html lang="ru">
      <body className="antialiased">
        <Suspense fallback={null}>
          <RootLayoutClient>
            {SHOW_CHROME && <Header />}
            <main className="page-wrap pt-24 pb-24">{children}</main>
            {SHOW_CHROME && <Footer />}
          </RootLayoutClient>
        </Suspense>

        {/* Yandex.Metrika 103743080 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j=0; j<document.scripts.length; j++){ if (document.scripts[j].src===r){return;} }
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);
          })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=103743080', 'ym');
          window.dataLayer = window.dataLayer || [];
          ym(103743080, 'init', { ssr:true, webvisor:true, clickmap:true, ecommerce:'dataLayer', accurateTrackBounce:true, trackLinks:true });
        `,
          }}
        />
        <noscript>
          <div><img src="https://mc.yandex.ru/watch/103743080" style={{position:'absolute',left:'-9999px'}} alt="" /></div>
        </noscript>

        {/* Organization JSON-LD */}
        <Script id="org-ld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(organizationJsonLd())}
        </Script>
        <Script id="website-ld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(websiteJsonLd())}
        </Script>
        <Script id="sitenav-ld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(siteNavJsonLd())}
        </Script>
      </body>
    </html>
  );
}
