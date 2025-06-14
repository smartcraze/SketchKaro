import { Hero } from "@/components/Hero";
import { ModeToggle } from "@/components/ModeToggler";

export default function Home() {
  return (
    <div>
      <ModeToggle />
      <Hero />
    </div>
  );
}
