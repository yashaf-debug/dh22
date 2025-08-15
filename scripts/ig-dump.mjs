// node >=18 (есть fetch из коробки)
// usage: node scripts/ig-dump.mjs --token=XXX --user=123456 --max=200
import fs from "node:fs/promises";
import path from "node:path";

const args = Object.fromEntries(process.argv.slice(2).map(a=>{
  const [k,v] = a.replace(/^--/,'').split('='); return [k,v ?? true];
}));
const TOKEN = args.token || process.env.IG_ACCESS_TOKEN;
const USER  = args.user  || process.env.IG_USER_ID;
const MAX   = Number(args.max || 200);

if(!TOKEN || !USER){
  console.error("Provide --token and --user (or env IG_ACCESS_TOKEN / IG_USER_ID)"); process.exit(1);
}

const OUT_DIR = path.join(process.cwd(), "public", "ig");
await fs.mkdir(OUT_DIR, { recursive: true });

const manifest = [];
let url = `https://graph.instagram.com/${USER}/media?fields=id,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${TOKEN}&limit=100`;

while(url && manifest.length < MAX){
  const r = await fetch(url);
  if(!r.ok){ console.error("Fetch error", r.status); break; }
  const j = await r.json();

  for(const m of (j.data || [])){
    if(manifest.length >= MAX) break;

    const isVideo = m.media_type === "VIDEO";
    const srcUrl = isVideo ? (m.thumbnail_url || m.media_url) : m.media_url;
    if(!srcUrl) continue;

    const ext = (new URL(srcUrl).pathname.split('.').pop() || "jpg").toLowerCase();
    const file = `${m.id}.${ext}`;

    try{
      const img = await fetch(srcUrl);
      if(!img.ok) continue;
      const buf = Buffer.from(await img.arrayBuffer());
      await fs.writeFile(path.join(OUT_DIR, file), buf);
      manifest.push({
        id: m.id,
        src: `/ig/${file}`,
        href: m.permalink,
        ts: m.timestamp,
        type: m.media_type
      });
      process.stdout.write(".");
    }catch(e){}
  }

  url = j.paging?.next || null;
}

await fs.writeFile(
  path.join(OUT_DIR, "manifest.json"),
  JSON.stringify({ data: manifest }, null, 2),
  "utf8"
);
console.log(`\nSaved ${manifest.length} media -> /public/ig and manifest.json`);
