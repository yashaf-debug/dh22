'use client';
import { useRef } from 'react';

export default function QtyInput({ name = 'qty', defaultValue = 1 }: { name?: string; defaultValue?: number }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <input
      ref={ref}
      type="number"
      name={name}
      min={1}
      step={1}
      defaultValue={defaultValue}
      className="input w-24"
      // никаких пропсов-обработчиков с сервера, только нативные
    />
  );
}

