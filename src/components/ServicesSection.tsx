import { Bike, ShoppingBag, Wrench, Settings, CalendarDays } from "lucide-react";

const services = [
  {
    icon: Bike,
    title: "Venda",
    description: "E-bikes novas e seminovas com garantia, revisão e certificado de inspeção Ekoa.",
    href: "#loja",
    cta: "Ver modelos",
  },
  {
    icon: ShoppingBag,
    title: "Acessórios",
    description: "Capacetes, baterias, peças e equipamentos para pedalar com segurança e estilo.",
    href: "#loja",
    cta: "Explorar loja",
  },
  {
    icon: Wrench,
    title: "Oficina especializada",
    description: "Reparos e upgrades feitos por técnicos especialistas em mobilidade elétrica.",
    href: "#oficina",
    cta: "Conhecer oficina",
  },
  {
    icon: Settings,
    title: "Manutenção",
    description: "Revisões preventivas, troca de pneu e cuidados que mantêm sua bike sempre pronta.",
    href: "#oficina",
    cta: "Agendar serviço",
  },
  {
    icon: CalendarDays,
    title: "Aluguel",
    description: "Quer experimentar antes de comprar? Alugue uma e-bike por dia e viva a ilha.",
    href: "#alugue",
    cta: "Ver aluguel",
  },
];

const ServicesSection = () => {
  return (
    <section id="servicos" className="py-20 md:py-32 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="uppercase tracking-[0.3em] text-sm font-medium text-primary mb-4 font-display">
            O que a Ekoa faz
          </p>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground leading-[0.95] mb-5">
            TUDO PARA A SUA<br />MOBILIDADE ELÉTRICA
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Da compra ao cuidado do dia a dia — e o aluguel quando você quiser experimentar. Uma casa completa para quem se move com energia limpa.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {services.map(({ icon: Icon, title, description, href, cta }, i) => (
            <a
              key={title}
              href={href}
              className="group relative flex flex-col rounded-2xl bg-card border border-border p-6 shadow-brand-sm hover:shadow-brand-lg hover:-translate-y-1 transition-all"
            >
              <span className="absolute top-5 right-6 text-xs font-bold text-muted-foreground/40 font-display">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground font-display leading-tight mb-2">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                {description}
              </p>
              <span className="text-xs font-bold uppercase tracking-wider text-primary font-display group-hover:text-ekoa-lime-dark transition-colors">
                {cta} →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
