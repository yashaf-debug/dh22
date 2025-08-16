'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FavItem = { id:number; slug:string; title:string; price_cents:number; cover_url?:string };

type State = {
  items: Record<number, FavItem>;
  toggle: (p: FavItem) => void;
  remove: (id:number) => void;
  clear: () => void;
  has: (id:number) => boolean;
  list: () => FavItem[];
  count: () => number;
};

export const useFavorites = create<State>()(
  persist(
    (set, get) => ({
      items: {},
      toggle: (p) => {
        const items = { ...get().items };
        if (items[p.id]) delete items[p.id];
        else items[p.id] = p;
        set({ items });
      },
      remove: (id) => set({ items: Object.fromEntries(Object.entries(get().items).filter(([k]) => +k !== id)) }),
      clear: () => set({ items: {} }),
      has: (id) => !!get().items[id],
      list: () => Object.values(get().items),
      count: () => Object.keys(get().items).length,
    }),
    { name: 'dh22:favorites' }
  )
);
