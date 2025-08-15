import { cookies } from "next/headers";
import AdminTokenProvider from "@/components/admin/AdminTokenProvider";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminLayout({
  children,
  params,
}: { children: React.ReactNode; params: any }) {
  // забираем t из текущего URL через заголовок x-invoke-path/query (Next RSC)
  // проще: пробросим его из searchParams на страницах и в клиенте
  // здесь только рисуем общий хедер
  return (
    <div>
      <AdminTokenProvider />
      <header className="px-6 pt-8">
        <AdminNav />
      </header>
      <hr className="my-6 border-neutral-200" />
      <main className="px-6 pb-16">
        {children}
      </main>
    </div>
  );
}
