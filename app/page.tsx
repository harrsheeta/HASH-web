import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import WallSection from "@/components/wall/WallSection";
import Clients from "@/components/Clients";
import About from "@/components/About";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Marquee />
      <WallSection />
      <Clients />
      <About />
      <Footer />
    </main>
  );
}
