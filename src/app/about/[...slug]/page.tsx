import ComingSoonBanner from "@/app/components/ComingSoon";

export const runtime = "edge";

export default function AboutNestedComingSoonPage() {
  return (
    <div className="mx-auto w-[calc(100%-32px)] max-w-[1400px] py-6 sm:w-[calc(100%-48px)] sm:py-10">
      <ComingSoonBanner />
    </div>
  );
}
