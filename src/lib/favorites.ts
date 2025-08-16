"use client";

const KEY = "dh22:favs";

export type FavId = number;

type Listener = (ids: FavId[]) => void;
const listeners = new Set<Listener>();

function notify(ids: FavId[]) {
  listeners.forEach(l => l(ids));
}

export function readFavs(): FavId[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FavId[]) : [];
  } catch {
    return [];
  }
}

export function writeFavs(ids: FavId[]) {
  const uniq: FavId[] = [];
  for (const n of ids) if (!uniq.includes(n)) uniq.push(n);
  localStorage.setItem(KEY, JSON.stringify(uniq));
  notify(uniq);
}

export function toggleFav(id: FavId) {
  const ids = new Set(readFavs());
  ids.has(id) ? ids.delete(id) : ids.add(id);
  const arr: FavId[] = [];
  ids.forEach(v => arr.push(v));
  writeFavs(arr);
}

export function isFav(id: FavId) {
  return readFavs().includes(id);
}

export function clearFavs() {
  writeFavs([]);
}

export function subscribeFavs(cb: Listener) {
  listeners.add(cb);
  // слушаем изменения между вкладками
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb(readFavs());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

