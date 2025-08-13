import { first } from '@/app/lib/db';
import { rub } from '@/app/lib/money';
import AddToCart from './ui-add-to-cart';
import Image from 'next/image';
import Script from 'next/script';

export const runtime = 'edge';
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p: any = await first(
    `SELECT name, description, price, category, slug, COALESCE(main_image, image_url) AS img
       FROM products WHERE slug=? AND active=1`,
    params.slug
  );

  const title = p?.name ? `${p.name} — DH22` : 'Товар — DH22';
  const url = `https://dh22.ru/product/${params.slug}`;

  return {
    title,
    description: p?.description || 'Женская одежда DH22',
    alternates: { canonical: url },
    openGraph: {
      type: 'product',
      url,
      title,
      description: p?.description || '',
      images: p?.img ? [{ url: p.img }] : [],
    },
    twitter: { card: 'summary_large_image', title, description: p?.description || '' },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p: any = await first(
    `SELECT slug,name,price,description,category,quantity,COALESCE(main_image,image_url) AS main_image,sizes,colors,gallery FROM products WHERE slug=? AND active=1 AND quantity>0`,
    params.slug
  );
  if (!p) return <div className="container mx-auto px-4 py-10">Товар не найден</div>;
  const sizes = JSON.parse(p.sizes || '[]');
  const colors = JSON.parse(p.colors || '[]');
  const gallery = JSON.parse(p.gallery || '[]');
  const images = [p.main_image, ...gallery].filter(
    (u: any) => typeof u === 'string' && (u.startsWith('/i/') || u.startsWith('http'))
  );
  const img = images[0] || '/placeholder.png';
  return (
    <div className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="relative w-full aspect-[3/4]">
        <Image src={img} alt={p.name} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover border" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="badge">DH22</div>
        <h1 className="text-2xl">{p.name}</h1>
        <div className="text-lg">{rub(p.price)}</div>
        <div className="text-sm opacity-80">{p.description}</div>
        <AddToCart product={{ slug: p.slug, name: p.name, price: p.price, category: p.category, images: images.length ? images : ['/placeholder.png'], sizes, colors, quantity: p.quantity }} />
      </div>
      <ProductJsonLd p={p} />
      <BreadcrumbLd p={p} />
    </div>
  );
}

function ProductJsonLd({ p }: { p: any }) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    sku: p.slug,
    category: p.category || 'Women',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'RUB',
      price: (p.price / 100).toFixed(2),
      availability: 'https://schema.org/InStock',
      url: `https://dh22.ru/product/${p.slug}`,
    },
  };
  return <Script id="product-ld" type="application/ld+json">{JSON.stringify(ld)}</Script>;
}

function BreadcrumbLd({ p }: { p: any }) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://dh22.ru/' },
      { '@type': 'ListItem', position: 2, name: p.category || 'Каталог', item: 'https://dh22.ru/womens' },
      { '@type': 'ListItem', position: 3, name: p.name, item: `https://dh22.ru/product/${p.slug}` },
    ],
  };
  return <Script id="bread-ld" type="application/ld+json">{JSON.stringify(ld)}</Script>;
}

