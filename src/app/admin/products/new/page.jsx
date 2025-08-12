"use client";
export const runtime = "edge";
import { useRouter } from "next/navigation";
import ProductForm from "../_Form";

export default function NewProductPage({ searchParams }) {
  const token = searchParams?.t || "";
  const router = useRouter();
  return (
    <div className="container mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl">Новый товар</h1>
      <ProductForm token={token} onSaved={() => router.push(`/admin/products?t=${encodeURIComponent(token)}`)} />
    </div>
  );
}

