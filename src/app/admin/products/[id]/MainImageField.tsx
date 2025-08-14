'use client';

import { useState } from 'react';
import { resolveImageUrl } from '@/lib/images';

export default function MainImageField({ initial }: { initial: string }) {
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
          src={resolveImageUrl(mainImage, 'width=600,fit=cover')}
          alt="preview"
          className="h-24 w-auto border mt-2 object-contain"
        />
      ) : null}
    </div>
  );
}
