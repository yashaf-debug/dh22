'use client';

import { useEffect, useRef, useState } from 'react';
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
  images?: string[] | null;
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
  const [gallery, setGallery] = useState<string[]>(
    Array.isArray(product.images) && product.images.length ? product.images : []
  );
  const [file, setFile] = useState<File | null>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

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

  async function handleUploadGallery(idx: number, file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/images/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (!data.ok) {
      alert(data.error || 'upload failed');
      return;
    }
    setGallery(prev => {
      const next = prev.slice();
      next[idx] = data.path;
      return next;
    });
  }

  useEffect(() => {
    async function loadVariants() {
      const res = await fetch(`/api/admin/products/${product.id}/variants`);
      const data = await res.json();
      setVariants(Array.isArray(data.variants) ? data.variants : []);
    }
    loadVariants();
  }, [product.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await fetch(`/api/admin/products/${product.id}/variants`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ variants }),
      });
    } catch (err) {
      console.error('Failed to save variants', err);
    }
    formRef.current?.submit();
  }

  return (
    <form
      ref={formRef}
      method="post"
      action={`/api/admin/products/${product.id}/update`}
      className="space-y-3"
      onSubmit={handleSubmit}
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
      <div className="space-y-2">
        <div className="font-medium">Галерея</div>
        {gallery.map((url, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              value={url}
              onChange={e => {
                const val = e.target.value;
                setGallery(g => g.map((u,i)=> i===idx? val : u));
              }}
              className="border px-3 py-2 w-full"
            />
            {url && <img src={r2Url(url)} alt="prev" style={{width:60,height:60,objectFit:'cover'}} />}
            <input type="file" accept="image/*" onChange={e => e.target.files && handleUploadGallery(idx, e.target.files[0])} />
            <button type="button" onClick={() => setGallery(g => g.filter((_,i)=>i!==idx))}>🗑</button>
          </div>
        ))}
        <button type="button" className="btn" onClick={() => setGallery(g => [...g, ''])}>+ Добавить</button>
      </div>
      <input type="hidden" name="images_json" value={JSON.stringify(gallery.filter(Boolean))} />
      <div className="space-y-2">
        <div className="font-medium">Варианты</div>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left">Цвет</th>
              <th className="text-left">Размер</th>
              <th className="text-left">Остаток</th>
              <th className="text-left">SKU</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v, idx) => (
              <tr key={idx} className="border-t">
                <td>
                  <input
                    value={v.color || ''}
                    onChange={e => setVariants(vars => vars.map((x,i)=> i===idx? { ...x, color: e.target.value }: x))}
                    className="border px-2 py-1"
                  />
                </td>
                <td>
                  <input
                    value={v.size || ''}
                    onChange={e => setVariants(vars => vars.map((x,i)=> i===idx? { ...x, size: e.target.value }: x))}
                    className="border px-2 py-1"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    value={v.stock || 0}
                    onChange={e => setVariants(vars => vars.map((x,i)=> i===idx? { ...x, stock: Number(e.target.value) }: x))}
                    className="border px-2 py-1 w-24"
                  />
                </td>
                <td>
                  <input
                    value={v.sku || ''}
                    onChange={e => setVariants(vars => vars.map((x,i)=> i===idx? { ...x, sku: e.target.value }: x))}
                    className="border px-2 py-1"
                  />
                </td>
                <td>
                  <button type="button" onClick={() => setVariants(vars => vars.filter((_,i)=>i!==idx))}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="btn" onClick={() => setVariants(v => [...v, { color:'', size:'', stock:0, sku:'' }])}>+ добавить вариант</button>
      </div>
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
