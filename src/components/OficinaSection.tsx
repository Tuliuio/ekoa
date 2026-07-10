import { CircleDot, Gauge, Zap, BatteryCharging, Disc, Wrench } from "lucide-react";

const items = [
  { icon: CircleDot, title: "Troca de pneu", description: "Pneus e câmaras trocados na hora, com opções para asfalto e trilha." },
  { icon: Gauge, title: "Revisão preventiva", description: "Check-up completo para sua e-bike rodar segura o ano inteiro." },
  { icon: Zap, title: "Diagnóstico elétrico", description: "Motor, controlador e sensores testados por especialistas." },
  { icon: BatteryCharging, title: "Upgrade de bateria", description: "Mais autonomia com baterias e conectores de qualidade." },
  { icon: Disc, title: "Reparo de freios", description: "Freios a disco regulados e pastilhas substituídas com precisão." },
  { icon: Wrench, title: "Ajustes e regulagens", description: "Transmissão, suspensão e componentes no ponto certo." },
];

const OficinaSection = () => {
  return (
    <section
      id="oficina"
      className="py-20 md:py-32 px-6"
      style={{ background: "linear-gradient(135deg, #0C2E22 0%, #12402F 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-14">
          <p className="uppercase tracking-[0.3em] text-sm font-medium text-secondary mb-4 font-display">
            Cuidado profissional
          </p>
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-[0.95] mb-5">
            OFICINA ESPECIALIZADA<br />& MANUTENÇÃO
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Nossa oficina é feita para mobilidade elétrica. Técnicos especialistas cuidam da sua bike — da troca de pneu ao diagnóstico do motor — para você seguir em movimento.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          {items.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-secondary/20 p-6 flex flex-col"
              style={{ background: "linear-gradient(160deg, rgba(12,46,34,0.85), rgba(18,64,47,0.4))" }}
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-5">
                <Icon className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-white font-display leading-tight mb-2">{title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        <a
          href="/entrar"
          className="bg-secondary text-secondary-foreground rounded-full px-8 py-4 text-base font-bold font-display hover:bg-ekoa-lime-dark transition-colors inline-block shadow-brand-glow"
        >
          Agendar um serviço →
        </a>
      </div>
    </section>
  );
};

export default OficinaSection;
