// src/app/admin/page.tsx
export const runtime = 'edge';

import AdminClient from './AdminClient';

export default function AdminPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const token = searchParams?.t || '';
  const q = searchParams?.q || '';
  const status = searchParams?.status || '';
  return <AdminClient token={token} initialQ={q} initialStatus={status} />;
}

