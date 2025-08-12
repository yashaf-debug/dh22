import { first } from "../../lib/db";
import { rub } from "../../lib/money";
import AddToCart from "./ui-add-to-cart";
export const runtime = "edge";

export default async function ProductPage({ params }) {
  const p = await first(
    "SELECT slug,name,price,description,quantity,COALESCE(main_image,image_url) AS main_image,sizes,colors,gallery FROM products WHERE slug=? AND active=1 AND quantity>0",
    params.slug
  );
  if (!p) return <div className="container mx-auto px-4 py-10">Товар не найден</div>;
  const sizes = JSON.parse(p.sizes || "[]");
  const colors = JSON.parse(p.colors || "[]");
  const gallery = JSON.parse(p.gallery || "[]");
  const images = [p.main_image, ...gallery].filter(Boolean);
  return (
    <div className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <img src={images[0] || "/placeholder.png"} alt={p.name} className="w-full aspect-[3/4] object-cover border" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="badge">DH22</div>
        <h1 className="text-2xl">{p.name}</h1>
        <div className="text-lg">{rub(p.price)}</div>
        <div className="text-sm opacity-80">{p.description}</div>
        <AddToCart product={{ slug: p.slug, name: p.name, price: p.price, images, sizes, colors, quantity: p.quantity }} />
      </div>
    </div>
  );
}

