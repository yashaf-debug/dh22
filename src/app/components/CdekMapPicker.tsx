"use client";

import { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window { ymaps: any; }
}

type Pvz = {
  code: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  work_time?: string;
  phones?: string;
};

function loadYmaps(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.ymaps && window.ymaps.Map) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=${encodeURIComponent(apiKey)}`;
    s.async = true;
    s.onload = () => {
      window.ymaps?.ready(() => resolve());
    };
    s.onerror = () => reject(new Error("Yandex Maps load error"));
    document.head.appendChild(s);
  });
}

export default function CdekMapPicker({
  city,
  cityCode,
  yandexApiKey,
  onSelect,
  buttonText = "Выбрать ПВЗ",
}: {
  city: string;
  cityCode?: number | null;
  yandexApiKey: string;
  onSelect: (pvz: Pvz) => void;
  buttonText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState<Pvz[]>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<any>(null);
  const clusterer = useRef<any>(null);

  const query = useMemo(() => {
    const q = new URLSearchParams();
    if (cityCode) q.set("city_code", String(cityCode));
    else q.set("city", city);
    return q.toString();
  }, [city, cityCode]);

  useEffect(() => {
    if (!open) return;
    let aborted = false;

    (async () => {
      try {
        setLoading(true);
        // 1) Точки ПВЗ
        const r = await fetch(`/api/shipping/cdek/pvz?${query}`, { cache: "no-store" });
        const arr: Pvz[] = await r.json().catch(() => []);
        if (aborted) return;
        setPoints(arr);

        // 2) Карта
        await loadYmaps(yandexApiKey);
        if (aborted) return;

        const ymaps = window.ymaps;
        // создаём карту один раз
        if (!mapObj.current && mapRef.current) {
          mapObj.current = new ymaps.Map(mapRef.current, {
            center: [55.751244, 37.618423], // Москва на случай отсутствия точек
            zoom: 10,
            controls: ["zoomControl", "typeSelector", "fullscreenControl"]
          }, {
            suppressMapOpenBlock: true
          });

          clusterer.current = new ymaps.Clusterer({
            preset: "islands#invertedVioletClusterIcons",
            groupByCoordinates: false,
            clusterDisableClickZoom: false,
          });
          mapObj.current.geoObjects.add(clusterer.current);
        }

        // очистим старые маркеры
        clusterer.current?.removeAll();

        const placemarks: any[] = [];
        let minLat = 90, minLon = 180, maxLat = -90, maxLon = -180;

        for (const p of arr) {
          if (!p.lat || !p.lon) continue;
          minLat = Math.min(minLat, p.lat); minLon = Math.min(minLon, p.lon);
          maxLat = Math.max(maxLat, p.lat); maxLon = Math.max(maxLon, p.lon);

          const pm = new ymaps.Placemark([p.lat, p.lon], {
            balloonContent: `
              <div style="max-width:260px">
                <div style="font-weight:600;margin-bottom:4px">${p.name}</div>
                <div style="margin-bottom:4px">${p.address}</div>
                ${p.work_time ? `<div style="margin-bottom:4px">${p.work_time}</div>` : ""}
                ${p.phones ? `<div style="margin-bottom:6px">${p.phones}</div>` : ""}
                <button id="pvz_${p.code}" style="padding:6px 10px;border:1px solid #999;background:#fff;cursor:pointer">Выбрать</button>
              </div>
            `
          }, { preset: "islands#violetIcon" });

          pm.events.add("balloonopen", () => {
            // делегируем клик по кнопке внутри балуна
            const id = `pvz_${p.code}`;
            setTimeout(() => {
              const btn = document.getElementById(id);
              if (btn) btn.onclick = () => {
                onSelect(p);
                setOpen(false);
              };
            }, 0);
          });

          placemarks.push(pm);
        }

        if (placemarks.length) {
          clusterer.current?.add(placemarks);
          const bounds = [[minLat, minLon], [maxLat, maxLon]];
          if (isFinite(minLat) && isFinite(maxLat)) {
            mapObj.current.setBounds(bounds, { checkZoomRange: true, zoomMargin: 40 });
          }
        } else {
          mapObj.current.setCenter([55.751244, 37.618423], 10);
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => { aborted = true; };
  }, [open, query, yandexApiKey, onSelect]);

  return (
    <>
      <button type="button" className="px-3 py-2 border" onClick={() => setOpen(true)}>
        {buttonText}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white w-[95vw] max-w-5xl h-[80vh] relative p-2 flex flex-col">
            <button
              type="button"
              className="absolute right-2 top-2 px-2 py-1 border"
              onClick={() => setOpen(false)}
            >
              ×
            </button>

            <div ref={mapRef} className="w-full h-full" />

            {loading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-sm opacity-80">
                Загружаем ПВЗ…
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
