
import Image from "next/image";
import bannerImage from "@/assets/Orive Women’s Fashion Boutique Banner.jpg";

export default function BrandStory() {
  return (
    <section className="relative w-full min-h-[100svh] overflow-hidden bg-[#FAF8F5]">
      <Image
        src={bannerImage}
        alt="House of Orive Women's Fashion Boutique"
        priority
        sizes="100vw"
        className="block h-auto w-full object-contain"
      />
    </section>
  );
}
