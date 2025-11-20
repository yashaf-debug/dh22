// src/app/info/page.tsx
import ComingSoon from "@/app/components/ComingSoon";
import { canonical } from "@/lib/seo";

export const runtime = "edge";

export const metadata = {
  title: "Информация — DH22",
  description: "Информация DH22 — минимализм, точную посадку и доставка по России без компромиссов.",
  alternates: { canonical: canonical("/info") },
};

export default function Page() {
  return (
    <main className="mx-auto w-[calc(100%-32px)] max-w-[1400px] py-6 sm:w-[calc(100%-48px)] sm:py-10">
      <ComingSoon />
    </main>
  );
}
