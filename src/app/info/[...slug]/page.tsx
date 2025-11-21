import ComingSoonBanner from "@/app/components/ComingSoon";

export const runtime = "edge";

export default function InfoNestedComingSoonPage() {
  return (
    <main className="mx-auto w-[calc(100%-32px)] max-w-[1400px] py-6 sm:w-[calc(100%-48px)] sm:py-10">
      <ComingSoonBanner />
    </main>
  );
}
