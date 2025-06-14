import { HowItWorks } from "@/components/how-it-works";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import Navbar from "@/components/Navbar";
import { WobbleCardDemo } from "@/components/WobbleCard";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <div className="md:m-20">
        <WobbleCardDemo />
      </div>
      <div className="md:m-20">
        <HowItWorks />
      </div>
      <Footer />
    </div>
  );
}
