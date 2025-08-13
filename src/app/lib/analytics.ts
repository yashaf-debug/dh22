'use client';

declare global {
  interface Window { ym?: any; dataLayer?: any[]; }
}

const YM_ID = 103743080;

function push(type: string, payload: any) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: type, ...payload });
    if (window.ym) {
      window.ym(YM_ID, 'params', { ecommerce: payload });
    }
  } catch {}
}

// Стандартизованные события
export const track = {
  view_item: (p: { id: string|number; name: string; price: number; category?: string; }) =>
    push('view_item', { item_id: p.id, item_name: p.name, price: p.price, item_category: p.category }),

  add_to_cart: (p: { id: string|number; name: string; price: number; qty: number; }) =>
    push('add_to_cart', { item_id: p.id, item_name: p.name, price: p.price, quantity: p.qty }),

  begin_checkout: (p: { value: number; items: any[] }) =>
    push('begin_checkout', { value: p.value, items: p.items }),

  select_pvz: (p: { code: string; address: string }) =>
    push('select_pvz', { pvz_code: p.code, pvz_address: p.address }),

  payment_method_selected: (p: { method: 'online'|'cod' }) =>
    push('payment_method_selected', { method: p.method }),

  purchase: (p: { order_number: string; value: number; currency?: string; items: any[] }) =>
    push('purchase', { transaction_id: p.order_number, value: p.value, currency: p.currency || 'RUB', items: p.items }),
};
