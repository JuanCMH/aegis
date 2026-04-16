import { Navbar } from "@/packages/landing/components/navbar";
import { Hero } from "@/packages/landing/components/hero";
import { FeaturesSection } from "@/packages/landing/components/features-section";
import { Manifesto } from "@/packages/landing/components/manifesto";
import { StackedSection } from "@/packages/landing/components/stacked-cards/stacked-section";
import { Pricing } from "@/packages/landing/components/pricing";
import { Footer } from "@/packages/landing/components/footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturesSection />
      <Manifesto />
      <StackedSection />
      <Pricing />
      <Footer />
    </>
  );
}
