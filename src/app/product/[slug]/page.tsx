import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";
import { getProductFull } from "@/lib/queries";

export const runtime = "edge";

export default async function Page({ params }: { params: { slug: string } }) {
  const product = await getProductFull(params.slug);
  if (!product) notFound();
  if (!product.images?.length) {
    product.images = ["/images/placeholder.png"];
  }
  return (
    <main className="mx-auto w-[calc(100%-48px)] max-w-[1400px] py-6">
      <ProductClient product={product} />
    </main>
  );
}

