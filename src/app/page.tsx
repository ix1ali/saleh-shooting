import ScrollProvider from "@/components/ScrollProvider";
import Preloader from "@/components/ui/Preloader";
import SiteChrome from "@/components/ui/SiteChrome";
import RangeHero from "@/components/sections/RangeHero";
import IntroSection from "@/components/sections/IntroSection";
import RangesGrid from "@/components/sections/RangesGrid";
import ExperienceSelector from "@/components/sections/ExperienceSelector";
import SessionSteps from "@/components/sections/SessionSteps";
import HoursLocation from "@/components/sections/HoursLocation";
import ContactCTA from "@/components/sections/ContactCTA";

export default function Home() {
  return (
    <>
      <ScrollProvider />
      <Preloader />
      <SiteChrome />

      <main className="shell">
        <RangeHero />
        <IntroSection />
        <RangesGrid />
        <ExperienceSelector />
        <SessionSteps />
        <HoursLocation />
        <ContactCTA />
      </main>
    </>
  );
}
