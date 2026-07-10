import brandbookEkoa from "@/assets/forest-store.jpg";
import { Shield, Wrench, Leaf } from "lucide-react";

const OriginSection = () => {
  return (
    <section id="sobre" className="py-20 md:py-32 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left - Image */}
        <div className="rounded-xl overflow-hidden">
          <img
            src={brandbookEkoa}
            alt="Natureza de Florianópolis — o universo da mobilidade elétrica Ekoa"
            width={800}
            height={600}
            className="w-full h-[500px] object-cover"
          />
        </div>

        {/* Right - Text content */}
        <div>
          <p className="uppercase tracking-[0.3em] text-xs font-medium text-muted-foreground mb-3 font-display">
            Nossa essência
          </p>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground leading-[0.95] mb-6">
            MOVIMENTO QUE<br />TRANSFORMA.
          </h2>
          <p className="text-lg text-foreground/80 leading-relaxed mb-4 max-w-md">
            Tecnologia que conecta pessoas, natureza e a energia de quem vive a ilha.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-10 max-w-md">
            A Ekoa nasceu em Florianópolis para transformar a forma como as pessoas se movem — unindo tecnologia, sustentabilidade e o estilo de vida da ilha em cada e-bike, na loja e na oficina.
          </p>

          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-xs font-bold uppercase text-foreground font-display">100% Segura</p>
              <p className="text-[10px] text-muted-foreground">Qualidade garantida</p>
            </div>
            <div className="text-center">
              <Wrench className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-xs font-bold uppercase text-foreground font-display">Oficina própria</p>
              <p className="text-[10px] text-muted-foreground">Cuidado especializado</p>
            </div>
            <div className="text-center">
              <Leaf className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-xs font-bold uppercase text-foreground font-display">Zero Emissão</p>
              <p className="text-[10px] text-muted-foreground">100% elétrica</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OriginSection;
