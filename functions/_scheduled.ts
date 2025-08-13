import type { PagesFunction } from "@cloudflare/workers-types";

export const onSchedule: PagesFunction = async (_event, _env, _ctx) => {
  await fetch("https://dh22.ru/sitemap.xml", {
    cf: { cacheTtl: 21600, cacheEverything: true }
  });
};
