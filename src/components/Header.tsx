import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import EkoaLogo from "@/components/EkoaLogo";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Over the dark hero the header is transparent -> use light content.
  const onDark = !scrolled;
  const textColor = onDark ? "text-white" : "text-foreground";
  const hoverColor = onDark ? "hover:text-secondary" : "hover:text-primary";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${scrolled ? "bg-background/85 backdrop-blur-md shadow-brand-sm" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <EkoaLogo className="h-9" invert={onDark} />
        </div>

        <nav className={`hidden md:flex items-center gap-7 text-sm font-medium uppercase tracking-widest font-display ${textColor}`}>
          <a href="#servicos" className={`${hoverColor} transition-colors`}>Serviços</a>
          <a href="#loja" className={`${hoverColor} transition-colors`}>Loja</a>
          <a href="#oficina" className={`${hoverColor} transition-colors`}>Oficina</a>
          <a href="#alugue" className={`${hoverColor} transition-colors`}>Aluguel</a>
          <a href="#sobre" className={`${hoverColor} transition-colors`}>Sobre</a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a href="/entrar" className={`text-sm font-semibold font-display uppercase tracking-widest ${textColor} ${hoverColor} transition-colors`}>
            Login
          </a>
          <a href="/entrar" className="bg-secondary text-secondary-foreground rounded-full px-5 py-2 text-sm font-bold font-display hover:bg-ekoa-lime-dark transition-colors">
            Acessar →
          </a>
        </div>

        <button className={`md:hidden ${textColor}`} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden mt-4 bg-primary rounded-2xl p-6 flex flex-col gap-4">
          <a href="#servicos" className="text-sm font-medium uppercase tracking-widest text-primary-foreground font-display">Serviços</a>
          <a href="#loja" className="text-sm font-medium uppercase tracking-widest text-primary-foreground font-display">Loja</a>
          <a href="#oficina" className="text-sm font-medium uppercase tracking-widest text-primary-foreground font-display">Oficina</a>
          <a href="#alugue" className="text-sm font-medium uppercase tracking-widest text-primary-foreground font-display">Aluguel</a>
          <a href="#sobre" className="text-sm font-medium uppercase tracking-widest text-primary-foreground font-display">Sobre</a>
          <a href="/entrar" className="border-2 border-primary-foreground text-primary-foreground rounded-full px-5 py-2 text-sm font-semibold text-center font-display">
            Login
          </a>
          <a href="/entrar" className="bg-secondary text-secondary-foreground rounded-full px-5 py-2 text-sm font-semibold text-center font-display">
            Acessar →
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
