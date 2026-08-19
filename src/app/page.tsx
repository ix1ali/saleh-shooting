import ScrollProvider from "@/components/ScrollProvider";
import Preloader from "@/components/ui/Preloader";
import SiteChrome from "@/components/ui/SiteChrome";
import RangeHero from "@/components/sections/RangeHero";
import IntroSection from "@/components/sections/IntroSection";
import ExperienceStory from "@/components/sections/ExperienceStory";
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
        <ExperienceStory />
        <ExperienceSelector />
        <SessionSteps />
        <HoursLocation />
        <ContactCTA />
      </main>
    </>
  );
}
