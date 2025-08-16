import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";
import { getProductFull, getBestsellers } from "@/lib/queries";
import Recommended from "@/components/product/Recommended";

export const runtime = "edge";

export default async function Page({ params }: { params: { slug: string } }) {
  const [product, bestsellers] = await Promise.all([
    getProductFull(params.slug),
    getBestsellers(4),
  ]);
  if (!product) notFound();
  if (!product.images?.length) {
    product.images = ["/images/placeholder.png"];
  }
  return (
    <main className="mx-auto w-[calc(100%-48px)] max-w-[1400px] pt-6 pb-24 md:pb-6">
      <ProductClient product={product} />
      <Recommended items={bestsellers} />
    </main>
  );
}

