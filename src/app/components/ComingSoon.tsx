import Image from "next/image";

export default function ComingSoon() {
  return (
    <section className="overflow-hidden rounded-dh22">
      <div className="relative aspect-video w-full">
        <Image
          src="https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/Coming-soon.jpg"
          alt="DH22 — скоро открытие"
          fill
          priority
          className="object-contain"
          sizes="100vw"
        />
      </div>
    </section>
  );
}
