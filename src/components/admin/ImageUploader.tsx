'use client';

import { useState } from 'react';
import { r2 } from '@/lib/images';

export default function ImageUploader({
  value,
  onChange,
  buttonText = 'Загрузить',
}: {
  value?: string | null;
  onChange: (path: string) => void;
  buttonText?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.set('file', file);
    const res = await fetch('/api/images/upload', { method: 'POST', body: fd });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) alert(json?.error || 'upload error');
    else onChange(json.path);
  }

  return (
    <div className="space-y-3">
      {value && (
        <img
          src={r2(value)}
          alt="preview"
          className="w-48 h-48 object-cover rounded-md border"
        />
      )}
      <label className="inline-flex items-center gap-2">
        <input type="file" accept="image/*" onChange={onFile} hidden />
        <span className="px-3 py-2 bg-black text-white rounded-md cursor-pointer">
          {loading ? 'Загрузка…' : buttonText}
        </span>
      </label>
    </div>
  );
}

