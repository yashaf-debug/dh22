export async function adminFetch(input: string, init?: RequestInit) {
  const t =
    typeof window !== "undefined"
      ? (new URLSearchParams(window.location.search).get("t") ||
         sessionStorage.getItem("admin_t")) : null;
  const url = new URL(input, typeof window !== "undefined" ? window.location.origin : "https://dh22.ru");
  if (t && !url.searchParams.get("t")) url.searchParams.set("t", t);
  return fetch(url.toString(), init);
}
