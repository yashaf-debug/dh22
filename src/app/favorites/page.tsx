import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Избранное — DH22',
  description: 'Избранное DH22 — сохраненные товары и подборки.',
  path: '/favorites',
  noIndex: true,
});

export default function Page() {
  redirect('/?panel=favorites');
}
