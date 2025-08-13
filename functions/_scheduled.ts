export const onSchedule = async (event: any, env: any, ctx: any) => {
  // прогреваем кэш sitemap раз в день
  await fetch('https://dh22.ru/sitemap.xml', { cf: { cacheTtl: 21600, cacheEverything: true } } as any);
};
