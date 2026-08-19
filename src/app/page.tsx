import ScrollProvider from "@/components/ScrollProvider";
import SiteChrome from "@/components/ui/SiteChrome";
import IntroGate from "@/components/hero/IntroGate";
import IntroSection from "@/components/sections/IntroSection";
import RangesGrid from "@/components/sections/RangesGrid";
import Armoury from "@/components/sections/Armoury";
import GoodToKnow from "@/components/sections/GoodToKnow";
import HoursLocation from "@/components/sections/HoursLocation";
import ContactCTA from "@/components/sections/ContactCTA";

export default function Home() {
  return (
    <>
      <ScrollProvider />
      <IntroGate />
      <SiteChrome />

      <main className="shell">
        <IntroSection />
        <RangesGrid />
        <Armoury />
        <GoodToKnow />
        <HoursLocation />
        <ContactCTA />
      </main>
    </>
  );
}
