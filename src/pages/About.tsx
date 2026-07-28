import { AboutHero } from "../components/about/AboutHero";
import { CompanyStory } from "../components/about/CompanyStory";
import { MissionVision } from "../components/about/MissionVision";
import { CoreValues } from "../components/about/CoreValues";
import { AchievementCounter } from "../components/about/AchievementCounter";
import { FounderSection } from "../components/about/FounderSection";
import { CTA } from "../components/about/CTA";

export default function About() {
  return (
    <main className="min-h-screen bg-white text-black overflow-x-hidden">

      {/* Hero Section */}
      <AboutHero />

      {/* Company Story */}
      <section id="story">
        <CompanyStory />
      </section>

      {/* Mission & Vision */}
      <MissionVision />

      {/* Core Values */}
      <CoreValues />

      {/* Achievement Counter */}
      <AchievementCounter />

      {/* Founder Section */}
      <FounderSection />

      {/* Call To Action */}
      <CTA />

    </main>
  );
}