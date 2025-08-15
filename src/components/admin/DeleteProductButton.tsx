"use client";

export default function DeleteProductButton({
  id,
  t,
  className = "rounded border px-3 py-1 text-sm text-red-600",
}: {
  id: number | string;
  t?: string | null;
  className?: string;
}) {
  const action = `/api/admin/products/${id}${t ? `?t=${encodeURIComponent(t)}` : ""}`;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm("Удалить товар?")) e.preventDefault();
  }

  return (
    <form action={action} method="POST" onSubmit={handleSubmit}>
      <input type="hidden" name="_method" value="DELETE" />
      <button className={className}>Удалить</button>
    </form>
  );
}
