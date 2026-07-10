import { useState, useEffect, useMemo } from "react";

const seedRandom = (seed: number) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

interface LetterStyle {
  translateX: number;
  translateY: number;
  rotate: number;
  opacity: number;
}

const WindLetter = ({ char, index, progress }: { char: string; index: number; progress: number }) => {
  const params = useMemo(() => ({
    dirX: (seedRandom(index * 3) - 0.3) * 180,
    dirY: (seedRandom(index * 3 + 1) - 0.5) * 120,
    rot: (seedRandom(index * 3 + 2) - 0.5) * 60,
    delay: seedRandom(index * 7) * 0.3,
  }), [index]);

  const p = Math.max(0, Math.min((progress - params.delay) / (1 - params.delay), 1));
  const eased = p * p;

  const style: React.CSSProperties = char === " " ? {} : {
    display: "inline-block",
    transform: `translate(${eased * params.dirX}px, ${eased * params.dirY}px) rotate(${eased * params.rot}deg)`,
    opacity: 1 - eased * 0.7,
    transition: "none",
  };

  if (char === " ") return <span>&nbsp;</span>;

  return (
    <span style={style} className="inline-block">
      {char}
    </span>
  );
};

const HeroSection = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollRange = 250;
      const value = Math.min(window.scrollY / scrollRange, 1);
      setProgress(value);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const line1 = "SE TEM MOVIMENTO,";
  const line2 = "TEM EKOA.";

  return (
    <section className="gradient-brand min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 relative">
      <p className="uppercase tracking-[0.3em] text-sm font-medium text-secondary mb-4 font-display">
        Mobilidade elétrica · Floripa
      </p>
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[0.9] text-white mb-6">
        <span className="sr-only">Ekoa — Aluguel de bikes elétricas em Florianópolis. </span>
        <span className="block">
          {line1.split("").map((char, i) => (
            <WindLetter key={i} char={char} index={i} progress={progress} />
          ))}
        </span>
        <span className="block">
          {line2.split("").map((char, i) => (
            <WindLetter key={i} char={char} index={i + line1.length} progress={progress} />
          ))}
        </span>
      </h1>
      <p className="max-w-md text-white/80 text-base md:text-lg mb-8 leading-relaxed">
        Tecnologia que conecta, movimento que transforma. E-bikes elétricas para viver Florianópolis com liberdade e energia limpa.
      </p>
      <a
        href="/entrar"
        className="bg-secondary text-secondary-foreground rounded-full px-8 py-4 text-lg font-bold font-display hover:bg-ekoa-lime-dark transition-colors inline-block mb-8 shadow-brand-glow"
      >
        Acessar plataforma →
      </a>

      {/* WhatsApp floating button */}
      <a
        href="http://wa.me/4831978987"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-primary rounded-full w-14 h-14 flex items-center justify-center shadow-brand-lg hover:scale-110 transition-transform"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-primary-foreground">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </section>
  );
};

export default HeroSection;
