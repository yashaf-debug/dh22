"use client";
import { useEffect, useState } from "react";

type Item = { id:string; src:string; href:string; ts?:string; type?:string };

export default function InstagramStripStatic() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetch("/ig/manifest.json")
      .then(r => r.ok ? r.json() : { data: [] })
      .then(j => setItems(Array.isArray(j.data) ? j.data : []))
      .catch(() => setItems([]));
  }, []);

  if (!items.length) return null;

  const loop = [...items, ...items];

  return (
    <section className="mx-auto max-w-[1400px] px-6 pb-24">
      <h2 className="mb-2 text-center text-5xl font-extrabold uppercase tracking-tight text-[#6C4EF6]">
        Follow us
      </h2>
      <p className="mb-8 text-center text-lg opacity-60">@dh22_am</p>

      <div className="relative overflow-hidden">
        <div className="flex gap-4 animate-[igscroll_40s_linear_infinite] hover:[animation-play-state:paused]">
          {loop.map((m, i) => (
            <a
              key={m.id + "_" + i}
              href={m.href}
              target="_blank"
              rel="noreferrer"
              className="block h-[220px] w-[220px] shrink-0 overflow-hidden rounded-[20px]"
            >
              <img
                src={m.src}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </a>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes igscroll { 0% {transform: translateX(0)} 100% {transform: translateX(-50%)} }
      `}</style>
    </section>
  );
}
