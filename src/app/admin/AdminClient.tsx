// src/app/admin/AdminClient.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authHeaders } from './_lib';

type Order = {
  id: number;
  number: string;
  status: string;
  amount_total: number;
  payment_method?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  delivery_method?: string | null;
  delivery_price?: number | null;
  created_at?: string | null;
};

export default function AdminClient({ token, initialQ, initialStatus }: { token: string; initialQ: string; initialStatus: string }) {
  const [q, setQ] = useState(initialQ);
  const [status, setStatus] = useState(initialStatus);
  const [items, setItems] = useState<Order[]>([]);

  async function load() {
    if (!token) { setItems([]); return; }
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    params.set('limit', '100');
    const r = await fetch(`/api/admin/orders?${params.toString()}`, { cache: 'no-store', headers: authHeaders(token) });
    const j = await r.json().catch(() => ({ ok:false, items:[] }));
    setItems(j.items || []);
  }

  useEffect(() => { load(); }, []);

  async function del(id: number) {
    if (!confirm('Удалить заказ?')) return;
    await fetch(`/api/admin/orders/${id}`, { method:'DELETE', headers: authHeaders(token) });
    load();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl mb-4">Заказы</h1>
      {!token && <div className="text-red-600 mb-4">Добавь ?t=ТВОЙ_ТОКЕН в URL</div>}

      <form className="mb-4 flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <input type="hidden" name="t" value={token} />
        <input
          name="q"
          value={q}
          placeholder="Поиск: номер / телефон / email"
          onChange={e => setQ(e.target.value)}
          className="border px-3 py-2 min-w-[240px]"
        />
        <select name="status" value={status} onChange={e => setStatus(e.target.value)} className="border px-3 py-2">
          <option value="">Все статусы</option>
          <option value="new">new</option>
          <option value="awaiting_payment">awaiting_payment</option>
          <option value="paid">paid</option>
          <option value="packed">packed</option>
          <option value="shipped">shipped</option>
          <option value="delivered">delivered</option>
          <option value="canceled">canceled</option>
          <option value="refunded">refunded</option>
        </select>
        <button className="px-4 py-2 border" type="submit">Искать</button>
      </form>

      <div className="space-y-2">
        {items.map(o => (
          <div key={o.id} className="border p-3 hover:bg-gray-50">
            <Link href={`/admin/${encodeURIComponent(o.number)}?t=${encodeURIComponent(token)}`} className="block">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">#{o.number}</div>
                  <div className="text-sm opacity-80">
                    {o.customer_name} • {o.customer_phone} • {o.customer_email}
                  </div>
                </div>
                <div className="text-sm text-right">
                  <div>{o.status}{o.payment_method ? ` • ${o.payment_method}` : ''}</div>
                  <div>{(Number(o.amount_total)/100).toFixed(2)} ₽</div>
                  <div className="opacity-60">{o.created_at}</div>
                </div>
              </div>
              <div className="text-xs opacity-70">
                Доставка: {o.delivery_method || '—'} • {(Number(o.delivery_price||0)/100).toFixed(2)} ₽
              </div>
            </Link>
            <button className="btn btn-danger btn-sm mt-2" onClick={() => del(o.id)}>Удалить</button>
          </div>
        ))}

        {!items.length && <div className="opacity-70">Нет заказов</div>}
      </div>
    </div>
  );
}

