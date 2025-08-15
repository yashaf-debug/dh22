"use client";
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const urlT = new URLSearchParams(window.location.search).get("t");
  if (urlT) {
    sessionStorage.setItem("admin_t", urlT);
    document.cookie = `admin_t=${urlT}; path=/; SameSite=Lax`;
    return urlT;
  }
  const s = sessionStorage.getItem("admin_t");
  if (s) return s;
  const m = document.cookie.match(/(?:^|; )admin_t=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}
export function useAdminToken() {
  return getToken();
}
