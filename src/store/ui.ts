'use client';
import { create } from 'zustand';

type UI = {
  favsOpen: boolean;
  cartOpen: boolean;
  openFavs: () => void;
  closeFavs: () => void;
  openCart: () => void;
  closeCart: () => void;
};

export const useUI = create<UI>((set) => ({
  favsOpen: false,
  cartOpen: false,
  openFavs: () => set({ favsOpen: true, cartOpen: false }),
  closeFavs: () => set({ favsOpen: false }),
  openCart: () => set({ cartOpen: true, favsOpen: false }),
  closeCart: () => set({ cartOpen: false }),
}));
