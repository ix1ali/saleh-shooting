import ScrollProvider from "@/components/ScrollProvider";
import Preloader from "@/components/ui/Preloader";
import SiteChrome from "@/components/ui/SiteChrome";
import RangeHero from "@/components/sections/RangeHero";
import IntroSection from "@/components/sections/IntroSection";
import ExperienceStory from "@/components/sections/ExperienceStory";
import ExperienceSelector from "@/components/sections/ExperienceSelector";
import FacilityShowcase from "@/components/sections/FacilityShowcase";
import ArcheryLine from "@/components/sections/ArcheryLine";
import SafetySection from "@/components/sections/SafetySection";
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
        <ExperienceStory />
        <ExperienceSelector />
        <FacilityShowcase />
        <ArcheryLine />
        <SafetySection />
        <HoursLocation />
        <ContactCTA />
      </main>
    </>
  );
}
