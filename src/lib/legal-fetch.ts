export const runtime = 'edge';

const MAP: Record<string, {url:string; title:string; h1:string}> = {
  delivery: { url: 'https://iwantconcept.store/page/delivery',         title: 'Доставка — DH22',                   h1: 'Доставка' },
  returns:  { url: 'https://iwantconcept.store/page/pravila-vozvrata', title: 'Возврат — DH22',                    h1: 'Возврат' },
  terms:    { url: 'https://iwantconcept.store/page/soglashenie',      title: 'Пользовательское соглашение — DH22',h1: 'Пользовательское соглашение' },
  privacy:  { url: 'https://iwantconcept.store/page/politika_konf',    title: 'Политика конфиденциальности — DH22',h1: 'Политика конфиденциальности' },
  oferta:   { url: 'https://iwantconcept.store/page/oferta',           title: 'Договор-оферта — DH22',             h1: 'Договор-оферта' },
};

export type LegalSlug = keyof typeof MAP;

// очень простой «санитайзер» под Edge (убрать скрипты/стили/обработчики событий)
function sanitize(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\son[a-z]+="[^"]*"/gi, '')
    .replace(/\son[a-z]+='[^']*'/gi, '');
}

function extractBody(html: string) {
  const main = html.match(/<main[\s\S]*?>([\s\S]*?)<\/main>/i);
  if (main?.[1]) return main[1];
  const body = html.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i);
  return body?.[1] || html;
}

export async function getLegal(slug: LegalSlug) {
  const meta = MAP[slug];
  if (!meta) return null;
  const res = await fetch(meta.url, { redirect: 'follow', cf: { cacheTtl: 3600, cacheEverything: true } } as any);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  let html = await res.text();
  html = extractBody(html);
  // замены бренда, домена и e-mail
  html = html
    .replace(/IWANT Concept Store/gi, 'DH22')
    .replace(/https?:\/\/(?:www\.)?iwantconcept\.store/gi, 'https://dh22.ru')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, 'info@dh22.ru');
  html = sanitize(html);
  return { ...meta, content: html };
}
