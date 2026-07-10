import EkoaLogo from "@/components/EkoaLogo";
import { Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
            <EkoaLogo className="h-8 mb-3" invert animateOnScroll={false} />
            <p className="text-sm max-w-sm leading-relaxed text-background/70">
              Aluguel de bikes elétricas em Florianópolis. Feel The Ekoa.
            </p>
            <address className="not-italic mt-3 text-xs text-background/50 leading-relaxed">
              <span className="block">Florianópolis, SC — Brasil</span>
              <a href="tel:+554831978987" className="hover:text-background/80 transition-colors">(48) 3197-8987</a>
              <span className="mx-2 opacity-40">·</span>
              <a href="/entrar" target="_blank" rel="noopener noreferrer" className="hover:text-background/80 transition-colors">app.ekoa.com.br</a>
            </address>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://www.instagram.com/ekoamobilidadeeletrica/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ekoa no Instagram"
                className="border border-background/20 rounded-full w-9 h-9 flex items-center justify-center hover:border-secondary hover:text-secondary transition-colors text-background/60"
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap gap-8 md:justify-end items-start">
            <a href="#sobre" className="text-sm text-background/70 hover:text-secondary transition-colors font-display">Sobre nós</a>
            <a href="#bikes" className="text-sm text-background/70 hover:text-secondary transition-colors font-display">Nossas bikes</a>
            <a href="#contato" className="text-sm text-background/70 hover:text-secondary transition-colors font-display">Converse conosco</a>
          </div>
        </div>

        <div className="border-t border-background/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-background/40">
          <p>© 2026 Ekoa. Todos os direitos reservados.</p>
          <a
            href="https://tuliu.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-secondary transition-colors"
          >
            Digital Infrastructure by <span className="font-semibold">Tuliu</span>
          </a>
          <div className="flex gap-6">
            <a href="#" className="hover:text-background/70 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-background/70 transition-colors">Termos</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
