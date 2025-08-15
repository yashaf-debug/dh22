import ProductFormClient from "./ProductFormClient";
import { getProductById } from "@/lib/adminQueries";

export default async function Page({ params, searchParams }) {
  const product = await getProductById(Number(params.id));
  return (
    <div>
      <h1 className="mb-6 text-3xl font-semibold">{product?.name || "Товар"}</h1>
      <ProductFormClient product={product} />
    </div>
  );
}
