// src/app/info/page.tsx
import Image from "next/image";
import { canonical } from "@/lib/seo";
import InfoTabs from "./InfoTabs";

export const runtime = "edge";

export const metadata = {
  title: "Информация — DH22",
  description: "Доставка и оплата, возврат и обмен, контакты DH22",
  alternates: { canonical: canonical("/info") },
};

function Hero() {
  return (
    <section className="relative h-[48vh] min-h-[300px] w-full overflow-hidden rounded-dh22">
      <Image
        src="https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/all-items.jpg"
        alt="DH22 — Информация"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-5xl font-black uppercase tracking-tight text-white sm:text-7xl">
          Info
        </h1>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <main className="mx-auto mb-16 mt-6 grid w-[calc(100%-48px)] max-w-[1400px] gap-8">
      <Hero />
      <InfoTabs />
      {/* Футер НЕ нужен здесь — он уже рендерится в layout */}
    </main>
  );
}
