"use client";
import { useEffect, useState } from "react";

export default function QuickNav() {
  const ids = ["bestsellers","cats","clothes","sale10","brand","insta"];
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
    }, { rootMargin: "-30% 0px -65% 0px", threshold: [0.1,0.25,0.5]});
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);
  const labels: Record<string,string> = {
    bestsellers:"Bestsellers", cats:"Бикини", clothes:"Одежда",
    sale10:"-10%", brand:"О бренде", insta:"Follow us"
  };
  return (
    <div className="fixed bottom-6 right-6 z-40 hidden flex-col gap-2 md:flex">
      {ids.map(id => (
        <a key={id} href={`/#${id}`}
           className={`rounded-xl border bg-white/80 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider backdrop-blur transition
           ${active===id ? "border-black/20 text-neutral-900" : "border-black/5 text-neutral-500 hover:text-neutral-800"}`}>
          {labels[id]}
        </a>
      ))}
    </div>
  );
}
