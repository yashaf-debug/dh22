import { SITE, collectionJsonLd, canonical } from "@/lib/seo";
import Script from "next/script";
import { getAccessories } from "@/lib/queries";
import ProductCard from "@/app/components/ProductCard";

export const metadata = {
  title: "Аксессуары",
  description: "Аксессуары DH22: сумки и шопперы. Минимализм, точная посадка и доставка по России.",
  alternates: { canonical: canonical("/catalog/accessories") },
};

export default async function Page() {
  const items = await getAccessories(48);
  return (
    <>
      <Script type="application/ld+json" id="ld-acc">
        {JSON.stringify(
          collectionJsonLd({
            name: "Аксессуары DH22",
            description: "Сумки и шопперы DH22",
            path: "/catalog/accessories",
            urls: items.map((p: any) => `${SITE.url}/product/${p.slug}`),
          })
        )}
      </Script>
      <div className="page-wrap py-10">
        <h1 className="mt-2 text-5xl font-black uppercase tracking-tight text-accent">Аксессуары</h1>
        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          {items.map((p: any) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </>
  );
}
