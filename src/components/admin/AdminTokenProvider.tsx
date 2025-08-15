"use client";
import { useEffect } from "react";
import { getToken } from "./useAdminToken";

export default function AdminTokenProvider() {
  useEffect(() => {
    // одна инициализация на входе
    getToken();
  }, []);
  return null;
}
