"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  useEffect(() => {
    // открываем слайдер на текущей странице
    if (location.hash !== "#favorites") {
      history.replaceState(null, "", "#favorites");
    }
    // если пользователь нажал «назад» — закрываем
    const onPop = () => {
      if (location.hash !== "#favorites") router.back();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [router]);

  // Делаем компактную «пустую» страницу, чтобы над ней был ваш контент под layout
  return null;
}

