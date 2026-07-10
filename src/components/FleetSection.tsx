import bikeGT20 from "@/assets/bike-gt20.png";
import bikeH9 from "@/assets/bike-h9.png";

const bikes = [
  {
    name: "GT20",
    image: bikeGT20,
    price: "R$ 89",
    period: "/ dia",
    tags: ["Urban + Style"],
    cardClass: "gradient-card-green",
    tagClass: "bg-secondary/20 text-secondary-foreground",
    specs: [
      { label: "Motor 1000W" },
      { label: "Som Bluetooth Integrado" },
      { label: "Peso Máximo 120kg" },
      { label: "60km de autonomia" },
    ],
  },
  {
    name: "H9",
    image: bikeH9,
    price: "R$ 67",
    period: "/ dia",
    tags: ["Freepower + Comfort"],
    cardClass: "gradient-card-yellow",
    tagClass: "bg-accent/20 text-accent-foreground",
    specs: [
      { label: "Motor 1000W" },
      { label: "Conforto para o passageiro" },
      { label: "Freio a disco" },
      { label: "50km de autonomia" },
    ],
  },
];

const FleetSection = () => {
  return (
    <section id="alugue" className="bg-muted py-20 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <p className="uppercase tracking-[0.3em] text-xs font-medium text-muted-foreground mb-3 font-display">
              Uma opção a mais
            </p>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground leading-[0.95]">
              PREFERE TESTAR?<br />ALUGUE POR DIA
            </h2>
          </div>
          <div className="flex items-end">
            <p className="text-muted-foreground leading-relaxed max-w-md">
              Antes de comprar a sua, experimente. E-bikes Premium para aluguel em Florianópolis — do Campeche à Lagoa da Conceição. A partir de <strong>R$67/dia</strong> com seguro incluso e KM ilimitado.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {bikes.map((bike) => (
            <div
              key={bike.name}
              className={`${bike.cardClass} rounded-xl p-8 flex flex-col shadow-brand-sm hover:shadow-brand-lg transition-shadow`}
            >
              <div className="flex items-start mb-4">
                <div className="flex flex-wrap gap-2">
                  {bike.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`${bike.tagClass} text-xs font-semibold px-3 py-1 rounded-full font-display`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center py-6">
                <img
                  src={bike.image}
                  alt={`Bike elétrica ${bike.name} Ekoa para aluguel em Florianópolis — motor 1000W, ${bike.specs[3].label}`}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="max-h-[250px] w-auto object-contain"
                />
              </div>

              <h3 className="text-3xl font-bold text-foreground mb-4">{bike.name}</h3>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {bike.specs.map((spec) => (
                  <span
                    key={spec.label}
                    className="bg-background/50 text-foreground text-xs font-medium px-3 py-2 rounded-full text-center"
                  >
                    {spec.label}
                  </span>
                ))}
              </div>

              <a
                href="/entrar"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-primary-foreground rounded-full px-6 py-3 text-sm font-bold uppercase tracking-wider text-center hover:bg-ekoa-forest-dark transition-colors inline-flex items-center justify-center gap-2 shadow-brand-md font-display"
              >
                Alugue agora →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FleetSection;
