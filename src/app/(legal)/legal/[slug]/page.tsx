export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLegal } from '@/lib/legal-fetch';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getLegal(params.slug as any);
  return { title: data?.title ?? 'DH22' };
}

export default async function LegalPage({ params }: { params: { slug: string }}) {
  const data = await getLegal(params.slug as any);
  if (!data) notFound();
  return (
    <section className="container mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-medium mb-6">{data.h1}</h1>
      <article
        className="prose max-w-none prose-p:leading-relaxed prose-li:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </section>
  );
}
