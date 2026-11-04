import IntroHero from "@/components/IntroHero";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import TechStackMatrix from "@/components/TechStackMatrix";
import ProjectShowcase from "@/components/ProjectShowcase";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <IntroHero />
      <Hero />
      <Manifesto />
      <TechStackMatrix />
      <ProjectShowcase />
      <Footer />
    </main>
  );
}
