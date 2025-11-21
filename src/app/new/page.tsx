import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { query } from "@/lib/d1";
import { fmtRub } from "@/lib/normalize";
import { canonical, collectionJsonLd, pageMetadata } from "@/lib/seo";

export const runtime = 'edge';

export const metadata: Metadata = pageMetadata({
  title: "Новинки — DH22",
  description: "Новинки DH22 — минимализм, точную посадку и доставка по России без компромиссов.",
  path: "/new",
});

export default async function NewPage() {
  const items = await query<any>(
    `SELECT id, slug, name, price, main_image, image_url
     FROM products
     WHERE active=1 AND (is_new=1 OR is_new='1')
     ORDER BY updated_at DESC, id DESC
     LIMIT 120`
  );

  return (
    <>
      <div className="mx-auto max-w-[1400px] px-6 pb-24">
        <h1 className="mt-10 mb-8 text-5xl font-extrabold uppercase tracking-tight text-[#6C4EF6]">Новинки</h1>

        {items.length === 0 ? (
          <p>Пока пусто — отметьте товары галочкой «Новинка» в админке.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p:any)=>(
              <li key={p.id} className="rounded-[28px] bg-neutral-50 p-4">
                <Link href={`/product/${p.slug}`}>
                  <img
                    src={p.main_image || p.image_url}
                    alt={p.title || p.name || p.slug}
                    className="mb-4 aspect-[4/5] w-full rounded-[20px] object-cover"
                  />
                  <div className="text-sm opacity-70">{p.name}</div>
                  <div className="text-lg font-semibold">{fmtRub(p.price)}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Script id="new-collection-ld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(
          collectionJsonLd({
            name: "Новинки",
            url: canonical("/new"),
            description: "Новинки DH22 — минимализм, точную посадку и доставка по России без компромиссов.",
            items: items.map((p:any) => ({
              name: p.name || p.slug,
              url: canonical(`/product/${p.slug}`),
            })),
          })
        )}
      </Script>
    </>
  );
}
