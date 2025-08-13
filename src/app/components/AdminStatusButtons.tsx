"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authHeaders } from "@/app/admin/_lib";

const BUTTONS: Array<{ key:string; label:string; cls?:string }> = [
  { key:"paid",       label:"Оплачен" },
  { key:"packed",     label:"Собран" },
  { key:"shipped",    label:"Отгружен" },
  { key:"delivered",  label:"Доставлен" },
  { key:"canceled",   label:"Отмена", cls:"border-red-600 text-red-600" },
];

export default function AdminStatusButtons({ number, token, current }: { number: string; token: string; current: string }) {
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();

  async function setStatus(s: string) {
    let body: any = { status: s };
    if (s === "shipped") {
      const tr = window.prompt("Введите трек-номер СДЭК (опционально)");
      if (tr && tr.trim()) body.tracking = tr.trim();
    }
    setBusy(s);
    try {
      const r = await fetch(`/api/admin/order/${encodeURIComponent(number)}/status`, {
        method: "PATCH",
        headers: { "content-type":"application/json", ...authHeaders(token) },
        body: JSON.stringify(body)
      });
      const j = await r.json();
      if (!j.ok) { alert(j.error || "Ошибка смены статуса"); }
      router.refresh();
    } catch (e:any) {
      alert(e?.message || "Ошибка сети");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {BUTTONS.map(b=>(
        <button
          key={b.key}
          onClick={()=> setStatus(b.key)}
          disabled={busy === b.key}
          className={`px-3 py-2 border ${b.cls || ""} ${current===b.key ? "opacity-50" : ""}`}
          title={current===b.key ? "Уже установлен" : ""}
        >
          {busy === b.key ? "..." : b.label}
        </button>
      ))}
    </div>
  );
}
