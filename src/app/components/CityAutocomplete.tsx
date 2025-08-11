"use client";

import { useEffect, useRef, useState } from "react";

type City = { code: number; name: string; region?: string; full: string };

export default function CityAutocomplete(props: {
  value: string;
  onSelect: (cityName: string, cityCode: number) => void;
  onInput?: (value: string) => void;
  placeholder?: string;
}) {
  const [term, setTerm] = useState(props.value || "");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<number | null>(null);
  const suppressOpen = useRef(false);           // <-- подавление "повторного" открытия
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setTerm(props.value || ""), [props.value]);

  // клик вне — закрыть
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as any)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // загрузка подсказок с дебаунсом
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    if (!term || term.trim().length < 2) {
      setItems([]); setOpen(false);
      props.onInput?.(term);
      return;
    }
    timer.current = window.setTimeout(async () => {
      // если только что выбрали — не делаем повторный запрос, не открываем заново
      if (suppressOpen.current) return;
      props.onInput?.(term);
      setLoading(true);
      try {
        const r = await fetch(`/api/shipping/cdek/cities?q=${encodeURIComponent(term)}&limit=12`, { cache: "no-store" });
        const j = await r.json();
        setItems(Array.isArray(j) ? j : []);
        setOpen(true);
      } catch {
        setItems([]); setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 180) as any;
  }, [term]);

  const pick = (c: City) => {
    // стопаем возможный "хвост" сетТаймаута, закрываем список и подавляем повторное открытие
    if (timer.current) window.clearTimeout(timer.current);
    suppressOpen.current = true;
    setTimeout(() => { suppressOpen.current = false; }, 250);

    setTerm(c.full);
    setItems([]);
    setOpen(false);
    props.onSelect(c.full, c.code);
  };

  const onFocus = () => {
    if (!suppressOpen.current && (items.length || loading)) setOpen(true);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && items.length) {
      e.preventDefault();
      pick(items[0]);
    }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="relative" ref={boxRef}>
      <input
        value={term}
        onChange={(e)=> setTerm(e.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        className="w-full border px-3 py-2"
        placeholder={props.placeholder || "Город"}
        autoComplete="off"
      />
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto border bg-white shadow">
          {loading && <div className="px-3 py-2 text-sm text-gray-500">Поиск…</div>}
          {!loading && items.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">Ничего не найдено</div>
          )}
          {!loading && items.map(c=>(
            <div
              key={c.code}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={()=> pick(c)}
            >
              {c.full}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
