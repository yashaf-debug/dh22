import ProductCard from "@/app/components/ProductCard";
import { all } from "../lib/db";

export const runtime = 'edge';
export const revalidate = 3600;

export async function generateMetadata() {
  const url = 'https://dh22.ru/womens';
  const title = 'Женская одежда — DH22';
  const desc = 'Женская одежда DH22';
  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: { type: 'website', url, title, description: desc },
    twitter: { card: 'summary_large_image', title, description: desc },
  };
}

export default async function Women() {
  const rows = await all(
    "SELECT id,slug,name,price,main_image,image_url,images_json FROM products WHERE category='Женская одежда' AND active=1 AND quantity>0 ORDER BY id DESC LIMIT 20"
  );
  const items = rows.map((p: any) => ({
    ...p,
    gallery: (() => { try { return JSON.parse(p.images_json ?? '[]'); } catch { return []; } })(),
  }));
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl mb-6">Женская одежда</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
