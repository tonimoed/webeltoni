import { Hero } from "@/components/sections/Hero";
import { MusicSection } from "@/components/sections/MusicSection";
import { VideoGallery } from "@/components/sections/VideoGallery";
import { Store } from "@/components/sections/Store";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <MusicSection />
      <VideoGallery />
      <Store />
      <Footer />
    </>
  );
}
