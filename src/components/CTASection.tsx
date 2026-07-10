const CTASection = () => {
  return (
    <section
      id="plataforma"
      className="py-24 md:py-36 px-6"
      style={{ background: "linear-gradient(135deg, #0C2E22 0%, #12402F 100%)" }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <p className="uppercase tracking-[0.3em] text-sm font-medium text-secondary mb-5 font-display">
          Se tem movimento, tem Ekoa
        </p>
        <h2 className="text-5xl md:text-7xl font-bold text-white leading-[0.95] mb-6">
          COMECE A SUA<br />JORNADA ELÉTRICA
        </h2>
        <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          Compre, cuide e experimente sua e-bike em um só lugar. Acesse a plataforma Ekoa e encontre a bike, o acessório ou o serviço perfeito para você.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/entrar"
            className="bg-secondary text-secondary-foreground rounded-full px-8 py-4 text-lg font-bold font-display hover:bg-ekoa-lime-dark transition-colors inline-block shadow-brand-glow"
          >
            Acessar a plataforma →
          </a>
          <a
            href="#loja"
            className="border-2 border-white/40 text-white rounded-full px-8 py-4 text-lg font-semibold font-display hover:bg-white hover:text-primary transition-colors inline-block"
          >
            Ver a loja
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
