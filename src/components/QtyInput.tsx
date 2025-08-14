'use client';
import { useState } from 'react';
export default function QtyInput({ name='qty', defaultValue=1 }:{name?:string;defaultValue?:number;}){
  const [qty, setQty] = useState<number>(defaultValue);
  return (
    <input type="number" name={name} min={1} step={1} value={qty}
      onChange={e=>setQty(Math.max(1, Number(e.target.value)||1))}
      inputMode="numeric" pattern="[0-9]*" className="border px-3 py-2 w-24" />
  );
}
