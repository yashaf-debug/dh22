import products from "../../../data/products.json";
import { rub } from "../../lib/money";

export function generateStaticParams() {
  return products.map(p=>({ slug: p.slug }));
}

export default function ProductPage({ params }) {
  const p = products.find(x=> x.slug === params.slug);
  if (!p) return <div className="container mx-auto px-4 py-10">Товар не найден</div>;
  return (
    <div className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <img src={p.images[0]} alt={p.name} className="w-full aspect-[3/4] object-cover border" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="badge">DH22</div>
        <h1 className="text-2xl">{p.name}</h1>
        <div className="text-lg">{rub(p.price)}</div>
        <div className="text-sm opacity-80">{p.description}</div>
        <AddToCart p={p}/>
      </div>
    </div>
  );
}

function AddToCart({ p }) {
  const sizes = p.sizes || [];
  const colors = p.colors || [];
  return (
    <form className="flex flex-col gap-3 mt-4" onSubmit={(e)=>{e.preventDefault(); add(p);}}>
      {sizes.length>0 && (
        <div className="flex gap-2 items-center">
          <span className="text-sm w-20">Размер</span>
          <select id="size" name="size" className="border px-2 py-1">
            {sizes.map(s=> <option key={s}>{s}</option>)}
          </select>
        </div>
      )}
      {colors.length>0 && (
        <div className="flex gap-2 items-center">
          <span className="text-sm w-20">Цвет</span>
          <select id="color" name="color" className="border px-2 py-1">
            {colors.map(c=> <option key={c}>{c}</option>)}
          </select>
        </div>
      )}
      <div className="flex gap-2 items-center">
        <span className="text-sm w-20">Кол-во</span>
        <input id="qty" name="qty" type="number" min="1" defaultValue="1" className="border px-2 py-1 w-24" />
      </div>
      <button className="btn btn-primary" type="submit">Добавить в корзину</button>
    </form>
  );
}

function add(p) {
  const sizeEl = document.getElementById('size');
  const colorEl = document.getElementById('color');
  const qtyEl = document.getElementById('qty');
  const size = sizeEl ? sizeEl.value : '';
  const color = colorEl ? colorEl.value : '';
  const qty = qtyEl ? parseInt(qtyEl.value||'1') : 1;
  const raw = localStorage.getItem('dh22_cart');
  const cart = raw ? JSON.parse(raw) : [];
  const existing = cart.find(i=> i.slug===p.slug && i.size===size && i.color===color);
  if (existing) existing.qty += qty; else cart.push({ slug:p.slug, name:p.name, price:p.price, image:p.images[0], size, color, qty });
  localStorage.setItem('dh22_cart', JSON.stringify(cart));
  alert('Товар добавлен в корзину');
}
