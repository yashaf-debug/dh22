import ProductCard from "@/app/components/ProductCard";
import { all } from "../lib/db";
export const runtime = 'edge';

export default async function NewArrivals() {
  const rows = await all(
    "SELECT id,slug,name,price,main_image,image_url,images_json FROM products WHERE active=1 AND quantity>0 ORDER BY id DESC LIMIT 20"
  );
  const items = rows.map((p) => ({
    ...p,
    gallery: (() => { try { return JSON.parse(p.images_json ?? '[]'); } catch { return []; } })(),
  }));
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl mb-6">Новинки</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
