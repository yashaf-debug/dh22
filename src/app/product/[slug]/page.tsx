import Image from "next/image";
import { getProductBySlug } from "@/app/lib/db-products";
import { productImageSrc } from "@/app/lib/products";
import ProductClient from "./ProductClient";

export const runtime = "edge";

export default async function ProductPage({ params }: { params:{slug:string} }) {
  const product: any = await getProductBySlug(params.slug);
  if (!product) {
    return <div className="container mx-auto px-4 py-10">Товар не найден</div>;
  }

  const src = productImageSrc(product);

  return (
    <div className="container mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
      <div>
        <Image
          src={src}
          alt={product.name}
          width={900}
          height={1200}
          sizes="(max-width:768px) 100vw, 50vw"
          className="w-full h-auto object-cover border"
        />
      </div>
      <ProductClient
        slug={product.slug}
        name={product.name}
        price={product.price}
        category={product.category}
      />
    </div>
  );
}
