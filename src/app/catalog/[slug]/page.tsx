import ProductCard from "@/app/components/ProductCard";
import { getByCategorySlug } from "@/lib/queries";

export const runtime = "edge";

export default async function Page({ params }: { params: { slug: string } }) {
  const items = await getByCategorySlug(params.slug, 120); // slug: clothes | accessories

  const titleMap: Record<string, string> = {
    clothes: "Одежда",
    accessories: "Аксессуары",
    new: "Новинки",
  };
  const title = titleMap[params.slug] ?? params.slug;

  const products = items.map((p: any) => ({
    ...p,
    name: p.title,
    price: p.price_cents,
    main_image: p.cover_url,
    gallery: [],
  }));

  return (
    <div className="page-wrap py-10">
      <h1 className="mt-2 text-5xl font-black uppercase tracking-tight text-accent">{title}</h1>
      <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
        {products.map((p: any) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}

