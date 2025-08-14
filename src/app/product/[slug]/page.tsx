import { notFound } from 'next/navigation';
import { queryAll } from '@/lib/db';
import { resolveImageUrl, firstFromJsonArray, formatPriceRubKopecks } from '@/lib/images';
import QtyInput from '@/components/QtyInput';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

type Product = {
  id: number; slug: string; name: string; description?: string | null;
  price: number; currency: string; main_image?: string | null; images?: string | null;
  colors?: string | null; sizes?: string | null; stock?: string | null; category?: string | null; subcategory?: string | null;
};

export default async function ProductPage({ params }: { params: { slug: string }}) {
  const rows = await queryAll<Product>(`SELECT * FROM products WHERE slug=? LIMIT 1`, params.slug);
  if (!rows.length) notFound();
  const p = rows[0];
  const firstImg = resolveImageUrl(p.main_image ?? firstFromJsonArray(p.images ?? undefined));
  const images: string[] = (() => { try { return JSON.parse(p.images ?? '[]'); } catch { return []; } })();
  const gallery = [p.main_image, ...images].filter(Boolean).map(u => resolveImageUrl(u!));
  const features = (p.description ?? '').split('/').map(s => s.trim()).filter(Boolean);
  const sizes: string[] = (() => { try { return JSON.parse(p.sizes ?? '[]'); } catch { return []; } })();
  const colors: string[] = (() => { try { return JSON.parse(p.colors ?? '[]'); } catch { return []; } })();
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img src={firstImg} alt={p.name} className="w-full h-auto object-cover border" />
          {!!gallery.length && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {gallery.map((g, i) => <img key={i} src={g} alt={`${p.name} ${i+1}`} className="w-full h-auto object-cover border" />)}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-medium">{p.name}</h1>
          <div className="mt-2 text-lg">{formatPriceRubKopecks(p.price, p.currency)}</div>
          <div className="mt-6 text-sm opacity-80 text-center">
            {features.length ? <div>{features.join(' / ')}</div> : null}
          </div>

          <form className="mt-6 space-y-3" action="/cart">
            {!!colors.length && (
              <div>
                <label className="block text-sm mb-1">Цвет</label>
                <select name="color" className="border px-3 py-2 w-full">
                  {colors.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}
            {!!sizes.length && (
              <div>
                <label className="block text-sm mb-1">Размер</label>
                <select name="size" className="border px-3 py-2 w-full">
                  {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm mb-1">Количество</label>
              <QtyInput name="qty" defaultValue={1}/>
            </div>
            <input type="hidden" name="slug" value={p.slug} />
            <button className="border px-4 py-2" type="submit">В корзину</button>
          </form>
        </div>
      </div>
    </div>
  );
}
