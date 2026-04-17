import { Hero } from "@/components/landing/hero";
import { CoffeeButton } from "@/components/landing/coffee-button";
import { DemoSection } from "@/components/landing/demo-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { UploadSection } from "@/components/landing/upload-section";
import { Footer } from "@/components/landing/footer";
import { fetchPreplyStats } from "@/lib/preply-stats";

export default async function HomePage() {
  const stats = await fetchPreplyStats();

  return (
    <main>
      <CoffeeButton />
      <Hero />
      <DemoSection />
      <HowItWorks />
      <UploadSection />
      <Footer lessonCount={stats.lessonCount} />
    </main>
  );
}
