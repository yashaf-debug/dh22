import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug, getVariants, getBestsellers } from "@/lib/queries";
import ProductTabs from "@/components/product/ProductTabs";
import Recommended from "@/components/product/Recommended";

export const runtime = "edge";

function parseImages(p: any): string[] {
  // поддерживаем любые поля: images_json / images / gallery / main_image
  const arr: string[] = [];
  const pushJson = (v?: string | null) => {
    if (!v) return;
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) arr.push(...parsed);
    } catch {}
  };
  pushJson(p.images_json);
  pushJson(p.images);
  pushJson(p.gallery);
  if (p.image_url) arr.push(p.image_url);
  if (p.main_image) arr.push(p.main_image);
  return Array.from(new Set(arr));
}

export default async function Page({ params }: { params: { slug: string } }) {
  const p = (await getProductBySlug(params.slug))?.[0];
  if (!p) notFound();

  const variants = await getVariants(p.id);
  const images = parseImages(p);

  const price = Number(p.price ?? 0);
  const colors = Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean)));
  const sizes  = Array.from(new Set(variants.map((v: any) => v.size).filter(Boolean)));

  const bestsellers = await getBestsellers(8);

  return (
    <main className="mx-auto w-[calc(100%-48px)] max-w-[1400px] py-6">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* ГАЛЕРЕЯ (вертикальный скролл, карточки-снап) */}
        <section className="space-y-4 lg:h-[86vh] lg:overflow-y-auto lg:pr-2 [scroll-snap-type:y_mandatory]">
          {images.length ? images.map((src, i) => (
            <div key={i} className="overflow-hidden rounded-dh22 [scroll-snap-align:start]">
              <Image
                src={src}
                alt={`${p.name} ${i + 1}`}
                width={1400}
                height={1800}
                className="w-full h-auto object-cover"
                priority={i === 0}
              />
            </div>
          )) : (
            <div className="rounded-dh22 bg-neutral-100 aspect-[3/4]" />
          )}
        </section>

        {/* ПРАВАЯ КОЛОНКА — прилипает */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-dh22 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-6">
              <h1 className="text-2xl font-black uppercase tracking-tight">{p.name}</h1>
              <div className="text-lg font-semibold">{price.toLocaleString("ru-RU")} ₽</div>
            </div>

            {/* Убираем блок "Долями" — просто не рендерим его */}

            {/* Цвет */}
            {colors.length > 0 && (
              <div className="mt-6">
                <div className="text-xs uppercase tracking-wider text-neutral-500">Цвет</div>
                <div className="mt-2 flex gap-2">
                  {colors.map((c) => (
                    <span key={c} className="inline-flex items-center rounded-full border px-3 py-1 text-sm">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Размер */}
            {sizes.length > 0 && (
              <div className="mt-4">
                <div className="text-xs uppercase tracking-wider text-neutral-500">Размер</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <span key={s} className="inline-flex items-center rounded-lg border px-3 py-1 text-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Кнопки */}
            <div className="mt-6 flex items-center gap-3">
              <button className="h-12 flex-1 rounded-xl bg-accent text-white font-bold uppercase tracking-wide">
                Добавить в корзину
              </button>
              <button className="h-12 w-12 grid place-items-center rounded-xl border">
                {/* иконка сердечка */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>

            {/* Вкладки */}
            <div className="mt-8">
              <ProductTabs
                description={p.description ?? ""}
                care={p.care_text ?? ""}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Рекомендуем (бестселлеры) */}
      <Recommended items={bestsellers} />
    </main>
  );
}

