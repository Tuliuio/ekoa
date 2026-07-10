import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import StoreSection from "@/components/StoreSection";
import OficinaSection from "@/components/OficinaSection";
import FleetSection from "@/components/FleetSection";
import OriginSection from "@/components/OriginSection";
import ChatSection from "@/components/ChatSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <ServicesSection />
      <StoreSection />
      <OficinaSection />
      <FleetSection />
      <OriginSection />
      <ChatSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Home;
