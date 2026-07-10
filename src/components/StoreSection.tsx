import { Zap, Award, ShoppingBag } from "lucide-react";
import storeImg from "@/assets/hero-rider.jpg";

const categories = [
  { icon: Zap, label: "BIKES NOVAS" },
  { icon: Award, label: "SEMINOVAS" },
  { icon: ShoppingBag, label: "ACESSÓRIOS" },
];

const StoreSection = () => {
  return (
    <section id="loja" className="py-20 md:py-32 px-6 bg-background">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Left content */}
        <div>
          <p className="uppercase tracking-[0.3em] text-sm font-medium text-primary mb-4 font-display">
            Venda · Loja Ekoa
          </p>
          <h2 className="text-5xl md:text-7xl font-bold text-foreground leading-[0.95] mb-6">
            SUA PRÓPRIA<br />LIBERDADE.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-lg">
            Leve o estilo Ekoa para casa. Bikes novas com tecnologia de ponta, seminovas revisadas e acessórios exclusivos para sua jornada.
          </p>

          {/* Category cards */}
          <div className="flex flex-wrap gap-4 mb-10">
            {categories.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="bg-muted rounded-lg px-6 py-5 flex flex-col items-start gap-3 min-w-[150px] hover:shadow-brand-md transition-shadow cursor-pointer"
              >
                <Icon className="w-6 h-6 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground font-display">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <a
            href="/entrar"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-foreground text-foreground rounded-full px-5 py-2 text-sm font-semibold font-display hover:bg-foreground hover:text-background transition-colors inline-block"
          >
            Ver bikes à venda →
          </a>

        </div>

        {/* Right image */}
        <div className="relative">
          <div className="rounded-xl overflow-hidden">
            <img
              src={storeImg}
              alt="Ekoa Store — compra de bikes elétricas novas e seminovas em Florianópolis"
              className="w-full h-[500px] md:h-[600px] object-cover"
              loading="lazy"
              width={800}
              height={1024}
            />
          </div>
          {/* Quote overlay */}
          <div className="absolute bottom-6 left-6 right-6 bg-secondary rounded-lg px-6 py-4">
            <p className="text-secondary-foreground font-bold text-sm md:text-base leading-snug uppercase font-display">
              "Existe caminho mais rápido. Nós preferimos o mais bonito"
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoreSection;
