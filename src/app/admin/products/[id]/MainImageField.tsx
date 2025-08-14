'use client';

import { useState } from 'react';
import ImageUploader from '@/components/admin/ImageUploader';

export default function MainImageField({ initial }: { initial: string }) {
  const [mainImage, setMainImage] = useState(initial);
  return (
    <div className="space-y-2">
      <input
        name="main_image"
        value={mainImage}
        onChange={(e) => setMainImage(e.target.value)}
        className="border px-3 py-2 w-full"
      />
      <ImageUploader value={mainImage} onChange={setMainImage} />
    </div>
  );
}
