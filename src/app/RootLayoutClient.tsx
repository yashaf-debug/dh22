'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUI } from '@/store/ui';
import FavoritesSheet from '@/components/overlays/FavoritesSheet';

export default function RootLayoutClient({ children }:{ children:React.ReactNode }) {
  const params = useSearchParams();
  const { openFavs } = useUI();
  useEffect(() => {
    if (params.get('panel') === 'favorites' || window.location.hash === '#favorites') {
      openFavs();
      if (window.location.hash === '#favorites') history.replaceState(null, '', window.location.pathname);
    }
  }, [params, openFavs]);

  return (
    <>
      {children}
      <FavoritesSheet />
      {/* здесь же можно отрендерить CartSheet, чтобы унифицировать */}
    </>
  );
}
