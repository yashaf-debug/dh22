import { createDraftProduct } from "@/lib/adminMutations";
import { redirect } from "next/navigation";

export default async function NewProductPage({ searchParams }: { searchParams: any }) {
  const t = searchParams?.t ? String(searchParams.t) : "";
  const id = await createDraftProduct();
  redirect({ pathname: `/admin/products/${id}`, query: t ? { t } : {} } as any);
}

