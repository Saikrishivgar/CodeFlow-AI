"use client";

import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSolutionSection } from "@/components/landing/problem-solution-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { ShowcaseSection } from "@/components/landing/showcase-section";
import { LanguagesSection } from "@/components/landing/languages-section";
import { CtaSection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { useGlobalShortcuts } from "@/hooks/use-keyboard-shortcuts";

export default function LandingPage() {
  useGlobalShortcuts({ enableSidebarShortcut: false });

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <ProblemSolutionSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ShowcaseSection />
        <LanguagesSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}

