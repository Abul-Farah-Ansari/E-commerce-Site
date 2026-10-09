
import Image from "next/image";
import bannerImage from "@/assets/Orive Women’s Fashion Boutique Banner.png";

export default function BrandStory() {
  return (
    <section className="relative h-screen h-[100svh] w-full overflow-hidden bg-[#FAF8F5]">
      <Image
        src={bannerImage}
        alt="House of Orive Women's Fashion Boutique"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
    </section>
  );
}
