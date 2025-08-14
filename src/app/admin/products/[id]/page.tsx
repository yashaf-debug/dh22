import { queryAll } from '@/lib/db';
import { resolveImageUrl } from '@/lib/images';

export const runtime = 'edge';

type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  main_image?: string | null;
  sizes?: string | null;
  colors?: string | null;
};

export default async function EditProduct({ params }: { params: { id: string } }) {
  const rows = await queryAll<Product>(`SELECT * FROM products WHERE id=? LIMIT 1`, params.id);
  if (!rows.length) {
    return <div className="container mx-auto px-4 py-8">Not found</div>;
  }
  const product = rows[0];

  return (
    <div className="container mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl">Правка товара</h1>
      <form method="post" action={`/api/admin/products/${product.id}/update`} className="space-y-3">
        <input name="name" defaultValue={product.name} className="input w-full" />
        <textarea name="description" defaultValue={product.description || ''} className="textarea w-full" />
        <input name="price" type="number" defaultValue={product.price} className="input w-full" />
        <input name="stock" type="number" defaultValue={product.stock} className="input w-full" />
        <MainImageField initial={product.main_image || ''} />
        <input name="sizes" defaultValue={product.sizes || '[]'} placeholder='["XS","S","M"]' className="input w-full" />
        <input name="colors" defaultValue={product.colors || '[]'} placeholder='["черный","белый"]' className="input w-full" />
        <button type="submit" className="btn btn-primary">Сохранить</button>
      </form>
      <form method="post" action={`/api/admin/products/${product.id}/delete`} onSubmit={(e) => {
        if (!confirm('Удалить товар?')) e.preventDefault();
      }}>
        <button type="submit" className="btn btn-danger btn-sm">Удалить</button>
      </form>
    </div>
  );
}

function MainImageField({ initial }: { initial: string }) {
  'use client';
  const { useState } = require('react');
  const [mainImage, setMainImage] = useState(initial);
  return (
    <div>
      <input
        name="main_image"
        value={mainImage}
        onChange={(e) => setMainImage(e.target.value)}
        className="input w-full"
      />
      {mainImage ? (
        <img
          src={resolveImageUrl(mainImage, 'width=600,quality=82')}
          alt="preview"
          className="h-24 w-auto border mt-2 object-contain"
        />
      ) : null}
    </div>
  );
}

