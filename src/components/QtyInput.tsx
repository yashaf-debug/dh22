"use client";
import { useState } from 'react';

export default function QtyInput({ name='qty', defaultValue=1 }:{name?:string; defaultValue?:number;}) {
  const [raw, setRaw] = useState(String(defaultValue));
  return (
    <input
      type="text"
      name={name}
      inputMode="numeric"
      pattern="[0-9]*"
      value={raw}
      onChange={(e)=>{
        // оставляем только цифры, допускаем пусто
        const v = e.target.value.replace(/[^\d]/g,'');
        setRaw(v);
      }}
      onBlur={()=>{
        const n = Math.max(1, parseInt(raw || '0', 10));
        setRaw(String(n));
      }}
      className="border px-3 py-2 w-24"
      placeholder="1"
    />
  );
}
