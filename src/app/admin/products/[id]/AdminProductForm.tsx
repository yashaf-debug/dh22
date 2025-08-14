'use client';

import { useState } from 'react';
import { toR2Url } from '@/lib/r2';

interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  main_image?: string | null;
  sizes?: string | null;
  colors?: string | null;
}

export default function AdminProductForm({ product }: { product: Product }) {
  const [form, setForm] = useState({
    name: product.name || '',
    description: product.description || '',
    price: product.price,
    stock: product.stock,
    main_image: product.main_image || '',
    sizes: product.sizes || '[]',
    colors: product.colors || '[]',
  });

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/images/upload', { method: 'POST', body: fd });
    if (!res.ok) {
      alert('upload error');
      return;
    }
    const data = await res.json();
    setForm(prev => ({ ...prev, main_image: data.path }));
  }

  return (
    <form
      method="post"
      action={`/api/admin/products/${product.id}/update`}
      className="space-y-3"
    >
      <label className="block">
        <div>Название</div>
        <input
          name="name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="border px-3 py-2 w-full"
        />
      </label>
      <label className="block">
        <div>Описание</div>
        <textarea
          name="description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="border px-3 py-2 w-full"
        />
      </label>
      <label className="block">
        <div>Цена (в копейках)</div>
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={e => setForm({ ...form, price: Number(e.target.value) })}
          className="border px-3 py-2 w-full"
        />
      </label>
      <label className="block">
        <div>Остаток</div>
        <input
          name="stock"
          type="number"
          value={form.stock}
          onChange={e => setForm({ ...form, stock: Number(e.target.value) })}
          className="border px-3 py-2 w-full"
        />
      </label>
      <label className="block">
        <div>Основное фото URL (строка /r2/&lt;key&gt;)</div>
        <input
          name="main_image"
          value={form.main_image}
          onChange={e => setForm({ ...form, main_image: e.target.value })}
          className="border px-3 py-2 w-full"
        />
      </label>
      <input type="file" accept="image/*" onChange={handleUpload} />
      <div>
        <div>Превью (картинка)</div>
        <img
          src={toR2Url(form.main_image) ?? ''}
          alt="preview"
          style={{ maxWidth: 200 }}
        />
      </div>
      <label className="block">
        <div>Размеры (JSON)</div>
        <input
          name="sizes"
          value={form.sizes}
          onChange={e => setForm({ ...form, sizes: e.target.value })}
          className="border px-3 py-2 w-full"
        />
      </label>
      <label className="block">
        <div>Цвета (JSON)</div>
        <input
          name="colors"
          value={form.colors}
          onChange={e => setForm({ ...form, colors: e.target.value })}
          className="border px-3 py-2 w-full"
        />
      </label>
      <button type="submit" className="btn btn-primary">
        Сохранить
      </button>
    </form>
  );
}
