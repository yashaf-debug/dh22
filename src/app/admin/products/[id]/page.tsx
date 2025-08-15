import { getProductById } from "@/lib/adminQueries";
import ProductFormClient from "./ProductFormClient";

export const runtime = 'edge';

export default async function Page({ params, searchParams }) {
  const id = Number(params.id);
  const data = await getProductById(id);
  if (!data) return <div className="p-6">Товар не найден</div>;

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-semibold">{data.product?.name || "Товар"}</h1>
      <ProductFormClient product={data.product} variants={data.variants || []} />
    </div>
  );
}
