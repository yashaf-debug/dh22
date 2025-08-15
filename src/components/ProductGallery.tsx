'use client';
import { useState } from 'react';

type Props = { images: string[]; alt: string };

export default function ProductGallery({ images, alt }: Props) {
  const imgs = images.filter(Boolean);
  const [active, setActive] = useState(0);

  if (!imgs.length) return null;

  return (
    <div className="pg">
      <div className="pg-main">
        <img src={imgs[active]} alt={alt} loading="eager" />
      </div>
      {imgs.length > 1 && (
        <div className="pg-thumbs">
          {imgs.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={`pg-thumb ${i===active?'pg-thumb--active':''}`}
              aria-label={`Показать фото ${i+1}`}
            >
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <style jsx>{`
        .pg-main { width:100%; aspect-ratio: 1/1; border:1px solid #eee; display:flex; align-items:center; justify-content:center; background:#fff; }
        .pg-main img { max-width:100%; max-height:100%; object-fit:contain; }
        .pg-thumbs { display:flex; gap:8px; margin-top:12px; overflow:auto; }
        .pg-thumb { border:1px solid #eee; padding:0; background:#fff; width:72px; height:72px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
        .pg-thumb img { max-width:100%; max-height:100%; object-fit:contain; }
        .pg-thumb--active { outline:2px solid #000; }
      `}</style>
    </div>
  );
}
