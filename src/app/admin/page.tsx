// src/app/admin/page.tsx
import type { Metadata } from 'next';

import AdminClient from './AdminClient';
import { pageMetadata } from '@/lib/seo';

export const runtime = 'edge';

export const metadata: Metadata = pageMetadata({
  title: 'Админка — DH22',
  description: 'Внутренний раздел администрирования DH22.',
  path: '/admin',
  noIndex: true,
});

export default function AdminPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const token = searchParams?.t || '';
  const q = searchParams?.q || '';
  const status = searchParams?.status || '';
  return <AdminClient token={token} initialQ={q} initialStatus={status} />;
}

