'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartLine = {
  /** уникальный ключ варианта для объединения одинаковых позиций */
  key: string;                 // `${id}:${color ?? ''}:${size ?? ''}`
  id: number;
  slug: string;
  title: string;
  price_cents: number;         // в копейках
  cover_url?: string;
  color?: string | null;
  size?: string | null;
  qty: number;
  stock?: number | null;       // если передаёте остаток — ограничим qty
  weight_g?: number;           // вес варианта в граммах
};

type State = {
  lines: Record<string, CartLine>;
  add: (
    line: Omit<CartLine, 'key' | 'qty'> & { qty?: number }
  ) => void;
  inc: (key: string) => void;
  dec: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;

  list: () => CartLine[];
  count: () => number;     // суммарное кол-во
  subtotal: () => number;  // сумма в копейках
};

const clamp = (v: number, min: number, max = Infinity) =>
  Math.max(min, Math.min(max, v));

export const useCart = create<State>()(
  persist(
    (set, get) => ({
      lines: {},

      add: (raw) => {
        const key = `${raw.id}:${raw.color ?? ''}:${raw.size ?? ''}`;
        const existing = get().lines[key];
        const nextQty = clamp((existing?.qty ?? 0) + (raw.qty ?? 1), 1, raw.stock ?? Infinity);

        const line: CartLine = {
          key,
          ...raw,
          weight_g: raw.weight_g ?? existing?.weight_g,
          qty: nextQty,
        };

        set((s) => ({ lines: { ...s.lines, [key]: line } }));
      },

      inc: (key) => {
        const l = get().lines[key]; if (!l) return;
        const qty = clamp(l.qty + 1, 1, l.stock ?? Infinity);
        set((s) => ({ lines: { ...s.lines, [key]: { ...l, qty } } }));
      },

      dec: (key) => {
        const l = get().lines[key]; if (!l) return;
        const qty = l.qty - 1;
        if (qty <= 0) {
          set((s) => {
            const { [key]: _, ...rest } = s.lines;
            return { lines: rest };
          });
        } else {
          set((s) => ({ lines: { ...s.lines, [key]: { ...l, qty } } }));
        }
      },

      setQty: (key, qty) => {
        const l = get().lines[key]; if (!l) return;
        const q = clamp(qty, 1, l.stock ?? Infinity);
        set((s) => ({ lines: { ...s.lines, [key]: { ...l, qty: q } } }));
      },

      remove: (key) => {
        set((s) => {
          const { [key]: _, ...rest } = s.lines;
          return { lines: rest };
        });
      },

      clear: () => set({ lines: {} }),

      list: () => Object.values(get().lines),
      count: () => Object.values(get().lines).reduce((a, l) => a + l.qty, 0),
      subtotal: () => Object.values(get().lines).reduce((a, l) => a + l.price_cents * l.qty, 0),
    }),
    { name: 'dh22:cart' }
  )
);

