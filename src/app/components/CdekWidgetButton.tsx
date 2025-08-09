"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    ISDEKWidjet: any;
  }
}

type Pvz = { code: string; address: string; name: string };

export default function CdekWidgetButton(props: {
  city: string;                      // "Москва, ..." — что выбрал пользователь
  onSelect: (pvz: Pvz) => void;      // вернуть выбранный ПВЗ
  buttonText?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loaded) return;
    const s = document.createElement("script");
    s.src = "https://widget.cdek.ru/widget.js";
    s.async = true;
    s.onload = () => setLoaded(true);
    document.body.appendChild(s);
  }, [loaded]);

  useEffect(() => {
    if (!open || !loaded) return;
    // монтируем виджет в модалку
    const node = document.getElementById("cdek_widget_container");
    if (!node) return;

    // старый официальный конструктор — ISDEKWidjet
    const w = new window.ISDEKWidjet({
      // если понадобится apiKey — можно добавить здесь, но обычно не требуется
      defaultCity: props.city || "Москва",
      country: "Россия",
      cityFrom: "Москва",
      link: "cdek_widget_container",
      goods: [ { length: 10, width: 10, height: 10, weight: 500 } ],
      onChoose: (point: any) => {
        props.onSelect({
          code: String(point.code || ""),
          address: String(point.PVZ?.Address || point.address || point.location?.address || ""),
          name: String(point.PVZ?.Name || point.name || point.code || "")
        });
        setOpen(false);
      }
    });

    return () => {
      try { (w as any)?.destroy?.(); } catch {}
    };
  }, [open, loaded, props.city]);

  return (
    <>
      <button
        className="px-3 py-2 border"
        onClick={() => setOpen(true)}
        disabled={!loaded}
        title={loaded ? "Открыть карту CДЭК" : "Загрузка виджета…"}
      >
        {props.buttonText || "Выбрать ПВЗ"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-[95vw] max-w-4xl h-[80vh] relative p-2">
            <button
              className="absolute right-2 top-2 px-2 py-1 border"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <div id="cdek_widget_container" className="w-full h-full" />
          </div>
        </div>
      )}
    </>
  );
}

