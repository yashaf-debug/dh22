import Image from "next/image";
import { cfLoader } from "@/app/lib/cfImage";
import { first } from "@/app/lib/db";
import ProductClient from "./ProductClient";

export const runtime = "edge";

async function getProduct(slug: string) {
  return first(
    `SELECT slug,name,price,category,COALESCE(main_image,image_url) AS image FROM products WHERE slug=? AND active=1 AND quantity>0`,
    slug
  );
}

export default async function ProductPage({ params }: { params:{slug:string} }) {
  const product: any = await getProduct(params.slug);
  if (!product) {
    return <div className="container mx-auto px-4 py-10">Товар не найден</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
      <div>
        <Image
          loader={cfLoader}
          src={product.image || "/placeholder.png"}
          alt={product.name}
          width={900}
          height={1200}
          sizes="(max-width:768px) 100vw, 50vw"
          className="w-full h-auto object-cover border"
        />
      </div>
      <ProductClient product={{ slug: product.slug, name: product.name, price: product.price, category: product.category }} />
    </div>
  );
}
