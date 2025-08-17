'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import FavoritesSheet from '@/components/overlays/FavoritesSheet';
import CartSheet from '@/components/overlays/CartSheet';
import CookieBanner from '@/components/CookieBanner';
import { useUI } from '@/store/ui';

export default function RootLayoutClient({ children }:{ children:React.ReactNode }) {
  const params = useSearchParams();
  const { openFavs, openCart } = useUI();

  useEffect(() => {
    const panel = params.get('panel');
    if (panel === 'favorites' || window.location.hash === '#favorites') {
      openFavs();
      if (window.location.hash === '#favorites') history.replaceState(null, '', window.location.pathname);
    }
    if (panel === 'cart') {
      openCart();
    }
  }, [params, openFavs, openCart]);

  return (
    <>
      {children}
      <FavoritesSheet />
      <CartSheet />
      <CookieBanner />
    </>
  );
}
