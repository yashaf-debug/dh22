import { SITE, collectionJsonLd, canonical } from "@/lib/seo";
import Script from "next/script";
import { getClothes } from "@/lib/queries";
import ProductCard from "@/app/components/ProductCard";

export const metadata = {
  title: "Одежда",
  description: "Одежда DH22: платья, топы, юбки и капсулы на каждый день. Минимализм, точная посадка и доставка по России.",
  alternates: { canonical: canonical("/catalog/clothes") },
};

export default async function Page() {
  const items = await getClothes(48);
  return (
    <>
      <Script type="application/ld+json" id="ld-clothes">
        {JSON.stringify(
          collectionJsonLd({
            name: "Одежда DH22",
            description: "Платья, топы, юбки и другие модели DH22",
            path: "/catalog/clothes",
            urls: items.map((p: any) => `${SITE.url}/product/${p.slug}`),
          })
        )}
      </Script>
      <div className="page-wrap py-10">
        <h1 className="mt-2 text-5xl font-black uppercase tracking-tight text-accent">Одежда</h1>
        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          {items.map((p: any) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </>
  );
}
