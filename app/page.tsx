import { Hero } from "@/components/sections/Hero";
import { LatestRelease } from "@/components/sections/LatestRelease";
import { Platforms } from "@/components/sections/Platforms";
import { About } from "@/components/sections/About";
import { VisualMoment } from "@/components/sections/VisualMoment";
import { MerchTavern } from "@/components/sections/MerchTavern";
import { Social } from "@/components/sections/Social";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <LatestRelease />
      <Platforms />
      <About />
      <VisualMoment />
      <MerchTavern />
      <Social />
      <Contact />
      <Footer />
    </>
  );
}
