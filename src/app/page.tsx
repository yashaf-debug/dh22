import CategoryTiles from "@/components/home/CategoryTiles";
import ClothesSection from "@/components/home/ClothesSection";
import InstagramStripStatic from "@/components/home/InstagramStripStatic";

export const runtime = 'edge';

export default function Page() {
  return (
    <div className="grid gap-16">
      <CategoryTiles />
      {/* @ts-expect-error Async Server Component */}
      <ClothesSection />
      <InstagramStripStatic />
    </div>
  );
}
