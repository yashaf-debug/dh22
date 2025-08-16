"use client";

import { useState } from "react";

const ACCENT = "#7B61FF";

export default function ProductTabs({
  description,
  care,
}: {
  description: string;
  care: string;
}) {
  const [tab, setTab] = useState<"desc"|"care"|"size">("desc");

  const TabBtn = ({k, children}: any) => (
    <button
      onClick={() => setTab(k)}
      className="rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wide"
      style={{ background: tab===k ? ACCENT : "transparent", color: tab===k ? "#fff" : "#111" }}
    >
      {children}
    </button>
  );

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <TabBtn k="desc">Описание</TabBtn>
        <TabBtn k="care">Состав и уход</TabBtn>
        <TabBtn k="size">Размерная сетка</TabBtn>
      </div>

      {tab === "desc" && (
        <div className="text-[15px] leading-7 text-neutral-800 whitespace-pre-wrap">{description}</div>
      )}

      {tab === "care" && (
        <div className="text-[15px] leading-7 text-neutral-800 whitespace-pre-wrap">
          {care || "Информация уточняется."}
        </div>
      )}

      {tab === "size" && (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-3 py-2 text-left"> </th>
                <th className="px-3 py-2 text-left">XS</th>
                <th className="px-3 py-2 text-left">S</th>
                <th className="px-3 py-2 text-left">M</th>
                <th className="px-3 py-2 text-left">L</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Обхват груди", "79–84", "85–89", "90–94", "95–99"],
                ["Обхват под грудью", "65–70", "70–75", "75–80", "80–85"],
                ["Обхват талии", "57–60", "60–65", "66–70", "71–75"],
                ["Обхват бёдер", "86–90", "90–94", "95–98", "99–103"],
                ["Размер чашки", "AA–A", "B", "C–D", "D"],
              ].map((row, i) => (
                <tr key={i} className="border-t">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-3">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

