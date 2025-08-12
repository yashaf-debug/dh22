export function withToken(url: string, t: string) {
  const u = new URL(url, typeof window === "undefined" ? "http://x" : window.location.origin);
  u.searchParams.set("token", t);
  return u.pathname + u.search;
}

