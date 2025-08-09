"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window { ISDEKWidjet: any; }
}

type Pvz = { code: string; address: string; name: string };

export default function CdekWidgetButton(props: {
  city: string;
  onSelect: (pvz: Pvz) => void;
  buttonText?: string;
}) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [fallbackList, setFallbackList] = useState<Pvz[] | null>(null); // список ПВЗ, если виджет не загрузился
  const [loading, setLoading] = useState(false);

  // Грузим скрипт один раз
  useEffect(() => {
    if (scriptLoaded) return;
    const s = document.createElement("script");
    s.src = "https://widget.cdek.ru/widget.js";
    s.async = true;
    s.onload = () => setScriptLoaded(true);
    s.onerror = () => setScriptLoaded(false);
    document.body.appendChild(s);
  }, [scriptLoaded]);

  // Инициализация виджета при открытии модалки
  useEffect(() => {
    if (!open) return;

    const mountWidget = () => {
      try {
        const node = document.getElementById("cdek_widget_container");
        if (!node) return;
        // если виджет доступен — рисуем карту
        if (window.ISDEKWidjet) {
          const w = new window.ISDEKWidjet({
            defaultCity: props.city || "Москва",
            country: "Россия",
            cityFrom: "Москва",
            link: "cdek_widget_container",
            // минимальные габариты — чтобы виджет не ругался
            goods: [ { length: 10, width: 10, height: 10, weight: 500 } ],
            onChoose: (point: any) => {
              const pvz = {
                code: String(point.code || ""),
                address: String(point.PVZ?.Address || point.address || point.location?.address || ""),
                name: String(point.PVZ?.Name || point.name || point.code || "")
              };
              props.onSelect(pvz);
              setOpen(false);
            }
          });
          return true;
        }
      } catch {}
      return false;
    };

    // Пытаемся чуть подождать скрипт
    const okNow = mountWidget();
    if (okNow) return;

    // Если скрипт ещё не загрузился — показываем заглушку и пытаемся подгрузить список ПВЗ как fallback
    setLoading(true);
    fetch(`/api/shipping/cdek/pvz?city=${encodeURIComponent(props.city || "Москва")}`, { cache: "no-store" })
      .then(r => r.json())
      .then((arr) => {
        const list = Array.isArray(arr) ? arr.map((p:any)=>({ code: p.code, name: p.name, address: p.address })) : [];
        setFallbackList(list);
      })
      .catch(()=> setFallbackList([]))
      .finally(()=> setLoading(false));
  }, [open, props.city]);

  const pickFallback = (pvz: Pvz) => {
    props.onSelect(pvz);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="px-3 py-2 border"
        onClick={() => setOpen(true)}   // всегда кликабельна
      >
        {props.buttonText || "Выбрать ПВЗ"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-[95vw] max-w-4xl h-[80vh] relative p-2 flex flex-col">
            <button
              type="button"
              className="absolute right-2 top-2 px-2 py-1 border"
              onClick={() => setOpen(false)}
            >
              ×
            </button>

            {/* контейнер виджета */}
            <div id="cdek_widget_container" className="w-full h-full" />

            {/* Fallback: список ПВЗ (если виджет не нарисовался) */}
            {(!window.ISDEKWidjet || fallbackList) && (
              <div className="absolute inset-0 bg-white overflow-auto p-3">
                {loading && <div className="text-sm opacity-70">Загружаем ПВЗ…</div>}
                {!loading && Array.isArray(fallbackList) && fallbackList.length === 0 && (
                  <div className="text-sm opacity-70">ПВЗ не найдены</div>
                )}
                {!loading && Array.isArray(fallbackList) && fallbackList.length > 0 && (
                  <div className="space-y-2">
                    {fallbackList.map((p)=>(
                      <div key={p.code} className="border p-2 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-sm opacity-80">{p.address}</div>
                        </div>
                        <button type="button" className="px-3 py-1 border" onClick={()=> pickFallback(p)}>
                          Выбрать
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

