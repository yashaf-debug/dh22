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
  const timer = useRef<number | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setTerm(props.value || ""), [props.value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as any)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    if (!term || term.length < 2) {
      setItems([]); setOpen(false);
      props.onInput?.(term);
      return;
    }
    timer.current = window.setTimeout(async () => {
      props.onInput?.(term);
      const r = await fetch(`/api/shipping/cdek/cities?q=${encodeURIComponent(term)}&limit=10`, { cache: "no-store" });
      const j = await r.json();
      setItems(Array.isArray(j) ? j : []);
      setOpen(true);
    }, 250) as any;
  }, [term]);

  const pick = (c: City) => {
    setTerm(c.full);
    setOpen(false);
    props.onSelect(c.full, c.code);
  };

  return (
    <div className="relative" ref={boxRef}>
      <input
        value={term}
        onChange={(e)=> setTerm(e.target.value)}
        onFocus={()=> items.length && setOpen(true)}
        className="w-full border px-3 py-2"
        placeholder={props.placeholder || "Город"}
        autoComplete="off"
      />
      {open && items.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto border bg-white shadow">
          {items.map(c=>(
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
      {open && items.length === 0 && (
        <div className="absolute z-50 mt-1 w-full border bg-white shadow px-3 py-2 text-sm text-gray-500">
          Ничего не найдено
        </div>
      )}
    </div>
  );
}

