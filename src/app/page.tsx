import { Hero } from "@/components/landing/hero";
import { CoffeeButton } from "@/components/landing/coffee-button";
import { DemoSection } from "@/components/landing/demo-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { UploadSection } from "@/components/landing/upload-section";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main>
      <CoffeeButton />
      <Hero />
      <DemoSection />
      <HowItWorks />
      <UploadSection />
      <Footer />
    </main>
  );
}
