import { PublicLayout } from "@/components/layout/PublicLayout";
import {
  HeroSection,
  HowItWorksSection,
  ForWhomSection,
  StatsSection,
  TrustSection,
  CTASection,
} from "@/components/landing/LandingSections";

const Index = () => {
  return (
    <PublicLayout>
      <HeroSection />
      <HowItWorksSection />
      <ForWhomSection />
      <StatsSection />
      <TrustSection />
      <CTASection />
    </PublicLayout>
  );
};

export default Index;
