'use client';

import { useState } from 'react';
import { r2Url } from '@/lib/r2';

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
  const [file, setFile] = useState<File | null>(null);

  async function handleUpload(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/images/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (!data.ok) {
      alert(data.error || 'upload failed');
      return;
    }
    setForm(prev => ({ ...prev, main_image: data.path }));
  }

  return (
    <form
      method="post"
      action={`/api/admin/products/${product.id}/update`}
      className="space-y-3"
    >
      <label className="field">
        <span>Название</span>
        <input
          name="name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="border px-3 py-2 w-full"
        />
      </label>
      <label className="field">
        <span>Описание</span>
        <textarea
          name="description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="border px-3 py-2 w-full"
        />
      </label>
      <label className="field">
        <span>Цена (в копейках)</span>
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={e => setForm({ ...form, price: Number(e.target.value) })}
          className="border px-3 py-2 w-full"
        />
      </label>
      <label className="field">
        <span>Остаток</span>
        <input
          name="stock"
          type="number"
          value={form.stock}
          onChange={e => setForm({ ...form, stock: Number(e.target.value) })}
          className="border px-3 py-2 w-full"
        />
      </label>
      <label className="field">
        <span>Основное фото URL</span>
        <input
          name="main_image"
          value={form.main_image}
          onChange={e => setForm({ ...form, main_image: e.target.value })}
          className="border px-3 py-2 w-full"
        />
      </label>
      <div className="flex items-center gap-2">
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
        <button type="button" className="btn" onClick={() => file && handleUpload(file)}>Загрузить</button>
      </div>
      {form.main_image && (
        <img
          src={r2Url(form.main_image)}
          alt="preview"
          style={{ width: 160, height: 160, objectFit: 'cover' }}
        />
      )}
      <label className="field">
        <span>Размеры (JSON)</span>
        <input
          name="sizes"
          value={form.sizes}
          onChange={e => setForm({ ...form, sizes: e.target.value })}
          className="border px-3 py-2 w-full"
        />
      </label>
      <label className="field">
        <span>Цвета (JSON)</span>
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
