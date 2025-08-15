'use client';

import { useState } from 'react';
import { r2Url } from '@/lib/r2';
import type { Product, ProductVariant } from '@/types/product';

type Props = { product: Product };

export default function AdminProductForm({ product }: Props) {
  const [name, setName] = useState(product.name || '');
  const [description, setDescription] = useState(product.description || '');
  const [priceRub, setPriceRub] = useState((product.price ?? 0) / 100);
  const [mainImage, setMainImage] = useState(product.main_image || '');
  const [gallery, setGallery] = useState<string[]>(Array.isArray(product.gallery) ? product.gallery : []);
  const [variants, setVariants] = useState<ProductVariant[]>(Array.isArray(product.variants) ? product.variants : []);
  const [file, setFile] = useState<File | null>(null);
  const [isBestseller, setIsBestseller] = useState(product?.is_bestseller === 1);

  async function handleUpload(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/images/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (!data.ok) {
      alert(data.error || 'upload failed');
      return;
    }
    setMainImage(data.path);
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
    setGallery(prev => prev.map((g, i) => (i === idx ? data.path : g)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const galleryUrls = gallery.map(g => g.trim()).filter(Boolean);
    const variantsPayload = variants
      .map(v => ({
        color: v.color.trim(),
        size: v.size.trim(),
        sku: v.sku?.trim() || null,
        stock: Number(v.stock) || 0,
      }))
      .filter(v => v.color && v.size);
    const fd = new FormData();
    fd.set('name', name);
    fd.set('description', description);
    fd.set('main_image', mainImage);
    fd.set('priceRub', String(priceRub));
    fd.set('is_bestseller', isBestseller ? '1' : '0');
    fd.set('gallery_json', JSON.stringify(galleryUrls));
    fd.set('variants_json', JSON.stringify(variantsPayload));
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: 'POST',
      body: fd,
    });
    const j = await res.json().catch(() => null);
    if (j?.ok) {
      location.href = `/admin/products/${product.id}?saved=1`;
    } else {
      alert(j?.error || 'save failed');
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <label className="field">
        <span>Название</span>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="border px-3 py-2 w-full"
        />
      </label>
      <label className="field">
        <span>Описание</span>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border px-3 py-2 w-full"
        />
      </label>
      <label className="field">
        <span>Цена, ₽</span>
        <input
          type="number"
          min={0}
          step={1}
          value={priceRub}
          onChange={e => setPriceRub(Number(e.target.value))}
          className="border px-3 py-2 w-full"
        />
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isBestseller} onChange={e => setIsBestseller(e.target.checked)} />
        <span>Bestseller</span>
      </label>
      <label className="field">
        <span>Основное фото URL</span>
        <input
          value={mainImage}
          onChange={e => setMainImage(e.target.value)}
          className="border px-3 py-2 w-full"
        />
      </label>
      <div className="flex items-center gap-2">
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
        <button type="button" className="btn" onClick={() => file && handleUpload(file)}>
          Загрузить
        </button>
      </div>
      {mainImage && <img src={r2Url(mainImage)} alt="preview" style={{ width: 160, height: 160, objectFit: 'cover' }} />}
      <div className="space-y-2">
        <div className="font-medium">Галерея</div>
        {gallery.map((url, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              value={url}
              onChange={e => setGallery(g => g.map((u, i) => (i === idx ? e.target.value : u)))}
              className="border px-3 py-2 w-full"
            />
            {url && <img src={r2Url(url)} alt="prev" style={{ width: 60, height: 60, objectFit: 'cover' }} />}
            <input type="file" accept="image/*" onChange={e => e.target.files && handleUploadGallery(idx, e.target.files[0])} />
            <button type="button" onClick={() => setGallery(g => g.filter((_, i) => i !== idx))}>🗑</button>
          </div>
        ))}
        <button type="button" className="btn" onClick={() => setGallery(g => [...g, ''])}>
          + Добавить
        </button>
      </div>
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
                    value={v.color}
                    onChange={e => setVariants(vars => vars.map((x, i) => (i === idx ? { ...x, color: e.target.value } : x)))}
                    className="border px-2 py-1"
                  />
                </td>
                <td>
                  <input
                    value={v.size}
                    onChange={e => setVariants(vars => vars.map((x, i) => (i === idx ? { ...x, size: e.target.value } : x)))}
                    className="border px-2 py-1"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    value={v.stock}
                    onChange={e => setVariants(vars => vars.map((x, i) => (i === idx ? { ...x, stock: Number(e.target.value) } : x)))}
                    className="border px-2 py-1 w-24"
                  />
                </td>
                <td>
                  <input
                    value={v.sku || ''}
                    onChange={e => setVariants(vars => vars.map((x, i) => (i === idx ? { ...x, sku: e.target.value } : x)))}
                    className="border px-2 py-1"
                  />
                </td>
                <td>
                  <button type="button" onClick={() => setVariants(vars => vars.filter((_, i) => i !== idx))}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          className="btn"
          onClick={() => setVariants(v => [...v, { color: '', size: '', stock: 0, sku: '' }])}
        >
          + добавить вариант
        </button>
      </div>
      <button type="submit" className="btn btn-primary">
        Сохранить
      </button>
    </form>
  );
}
