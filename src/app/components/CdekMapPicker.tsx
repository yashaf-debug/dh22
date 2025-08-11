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
      resolve(); return;
    }
    const s = document.createElement("script");
    s.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=${encodeURIComponent(apiKey)}`;
    s.async = true;
    s.onload = () => window.ymaps?.ready(() => resolve());
    s.onerror = () => reject(new Error("Yandex Maps load error"));
    document.head.appendChild(s);
  });
}

function norm(s: string) {
  return String(s || "").toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
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
  const [mode, setMode] = useState<"map"|"list">("map"); // переключатель
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState<Pvz[]>([]);
  const [q, setQ] = useState("");
  const [errMap, setErrMap] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<any>(null);
  const clusterer = useRef<any>(null);
  const timer = useRef<number | null>(null);

  const query = useMemo(() => {
    const sp = new URLSearchParams();
    if (cityCode) sp.set("city_code", String(cityCode));
    else sp.set("city", city);
    return sp.toString();
  }, [city, cityCode]);

  // Вспомогательная фильтрация (клиентская) — для режима "Списком"
  const filtered = useMemo(() => {
    if (!q) return points;
    const nq = norm(q);
    return points.filter(p => norm(`${p.name} ${p.address}`).includes(nq));
  }, [points, q]);

  useEffect(() => {
    if (!open) return;
    let aborted = false;

    (async () => {
      try {
        setLoading(true);
        setErrMap(null);

        // 1) Подгружаем точки ПВЗ (без фильтра — полной выборкой, максимум ~200)
        const r = await fetch(`/api/shipping/cdek/pvz?${query}`, { cache: "no-store" });
        const arr: Pvz[] = await r.json().catch(() => []);
        if (aborted) return;
        setPoints(arr);

        // 2) Если выбран режим "Карта" — пробуем отрисовать
        if (mode === "map") {
          try {
            await loadYmaps(yandexApiKey);
            if (aborted) return;

            const ymaps = window.ymaps;
            if (!mapObj.current && mapRef.current) {
              mapObj.current = new ymaps.Map(mapRef.current, {
                center: [55.751244, 37.618423],
                zoom: 10,
                controls: ["zoomControl", "typeSelector", "fullscreenControl"]
              }, { suppressMapOpenBlock: true });
              clusterer.current = new ymaps.Clusterer({
                preset: "islands#invertedVioletClusterIcons",
                groupByCoordinates: false,
                clusterDisableClickZoom: false,
              });
              mapObj.current.geoObjects.add(clusterer.current);
            }

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
                const id = `pvz_${p.code}`;
                setTimeout(() => {
                  const btn = document.getElementById(id);
                  if (btn) btn.onclick = () => { onSelect(p); setOpen(false); };
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
          } catch (e: any) {
            setErrMap(e?.message || "Карта недоступна");
            setMode("list"); // автоматом на «Списком»
          }
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => { aborted = true; };
  }, [open, query, yandexApiKey, mode, onSelect]);

  // Дебаунс поиска в режиме «Списком»
  const onChangeQ: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const v = e.target.value;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setQ(v), 200) as any;
  };

  return (
    <>
      <button type="button" className="px-3 py-2 border" onClick={() => { setOpen(true); setMode("map"); }}>
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

            {/* Переключатель режимов */}
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                className={`px-3 py-1 border ${mode==="map" ? "bg-gray-100" : ""}`}
                onClick={()=> setMode("map")}
              >Карта</button>
              <button
                type="button"
                className={`px-3 py-1 border ${mode==="list" ? "bg-gray-100" : ""}`}
                onClick={()=> setMode("list")}
              >Списком</button>

              {errMap && <div className="text-xs text-red-600 ml-3">Карта: {errMap}</div>}
            </div>

            {/* Режим карта */}
            {mode === "map" && <div ref={mapRef} className="w-full h-full" />}

            {/* Режим списком: поиск + список */}
            {mode === "list" && (
              <div className="flex flex-col w-full h-full">
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Поиск по адресу или названию ПВЗ…"
                    onChange={onChangeQ}
                    className="w-full border px-3 py-2"
                  />
                </div>
                <div className="flex-1 overflow-auto">
                  {filtered.length === 0 ? (
                    <div className="text-sm opacity-70 px-2">Ничего не найдено</div>
                  ) : (
                    <div className="space-y-2">
                      {filtered.map(p => (
                        <div key={p.code} className="border p-2 flex justify-between items-center">
                          <div>
                            <div className="font-medium">{p.name}</div>
                            <div className="text-sm opacity-80">{p.address}</div>
                            <div className="text-xs opacity-70">
                              {p.work_time || ""} {p.phones ? ` · ${p.phones}` : ""}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="px-3 py-1 border"
                            onClick={()=> { onSelect(p); setOpen(false); }}
                          >
                            Выбрать
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

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
