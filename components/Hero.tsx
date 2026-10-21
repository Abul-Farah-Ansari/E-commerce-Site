
import heroImage from "../assets/images/hero2.jpeg";

export default function Hero() {
  return (
    <section className="m-0 w-full bg-white p-0">
      <img
        src={heroImage.src}
        alt="House of Orive fashion collection"
        className="m-0 block h-auto w-full p-0"
        fetchPriority="high"
      />
    </section>
  );
}
