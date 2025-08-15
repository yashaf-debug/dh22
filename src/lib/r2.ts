export function r2Url(path?: string) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/r2/")) {
    const base = (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE || "").replace(/\/$/, "");
    return `${base}/${path.slice(4)}`;
  }
  return path;
}
