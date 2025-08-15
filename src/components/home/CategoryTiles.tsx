const TILES = [
  { title: "Новинки", href: "/new", image: "/images/tiles/new.jpg" },
  { title: "Одежда", href: "/catalog/clothes", image: "/images/tiles/clothes.jpg" },
  { title: "Аксессуары", href: "/catalog/accessories", image: "/images/tiles/accessories.jpg" },
];

export default function CategoryTiles() {
  return (
    <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-6 lg:grid-cols-2">
      <a href={TILES[0].href} className="group relative overflow-hidden rounded-[28px]">
        <img src={TILES[0].image} className="h-full w-full object-cover" alt="" />
        <span className="absolute left-8 top-8 rounded-full bg-black/40 px-6 py-3 text-4xl font-extrabold uppercase tracking-wide text-white">
          {TILES[0].title}
        </span>
      </a>

      <div className="grid grid-cols-1 gap-8">
        {TILES.slice(1).map((t)=> (
          <a key={t.href} href={t.href} className="group relative overflow-hidden rounded-[28px]">
            <img src={t.image} className="h-full w-full object-cover" alt="" />
            <span className="absolute left-8 top-8 rounded-full bg-black/40 px-6 py-3 text-4xl font-extrabold uppercase tracking-wide text-white">
              {t.title}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
