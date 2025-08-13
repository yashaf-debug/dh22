'use client';
import { useSearchParams } from 'next/navigation';
import AdminHeader from './AdminHeader';

export default function AdminLayout({ children }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('t') || '';
  return (
    <>
      <AdminHeader token={token} />
      {children}
    </>
  );
}
