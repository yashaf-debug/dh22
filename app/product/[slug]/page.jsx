import products from "@data/products.json";
import { rub } from "../../lib/money";
import AddToCart from "./ui-add-to-cart";

export function generateStaticParams() {
  return products.map(p => ({ slug: p.slug }));
}

export default function ProductPage({ params }) {
  const p = products.find(x => x.slug === params.slug);
  if (!p) return <div className="container mx-auto px-4 py-10">Товар не найден</div>;
  return (
    <div className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <img src={p.images[0]} alt={p.name} className="w-full aspect-[3/4] object-cover border" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="badge">DH22</div>
        <h1 className="text-2xl">{p.name}</h1>
        <div className="text-lg">{rub(p.price)}</div>
        <div className="text-sm opacity-80">{p.description}</div>
        <AddToCart product={p} />
      </div>
    </div>
  );
}
