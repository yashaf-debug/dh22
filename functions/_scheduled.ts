export const onSchedule: PagesFunction = async (event, env, ctx) => {
  await fetch('https://dh22.ru/sitemap.xml', { cf: { cacheTtl: 21600, cacheEverything: true } });
};
