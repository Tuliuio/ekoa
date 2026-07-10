import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Qual o preço do aluguel de bike elétrica em Florianópolis?",
    answer:
      "A Ekoa oferece aluguel de bikes elétricas em Florianópolis a partir de R$67/dia (modelo H9) ou R$89/dia (modelo GT20). Disponibilizamos também planos semanais e mensais com descontos progressivos. Acesse app.ekoa.com.br para reservar.",
  },
  {
    question: "Quais bairros e praias de Florianópolis posso explorar de bike elétrica?",
    answer:
      "Com autonomia de 50 a 60km por carga, você pode explorar toda a ilha: Campeche, Lagoa da Conceição, Beira-Mar Norte, Jurerê Internacional, Ingleses, Ribeirão da Ilha, Trindade e muito mais. As e-bikes da Ekoa são perfeitas tanto para trilhas quanto para o asfalto.",
  },
  {
    question: "Como funciona o aluguel de e-bikes na Ekoa?",
    answer:
      "É simples! Acesse nossa plataforma em app.ekoa.com.br, escolha o modelo, o período desejado e retire sua bike no ponto mais próximo em Florianópolis. Todas as bikes vêm com seguro incluso e KM ilimitado.",
  },
  {
    question: "Preciso de habilitação (CNH) para pilotar uma e-bike?",
    answer:
      "Não! Nossas e-bikes são classificadas como bicicletas elétricas e não exigem CNH. Basta ter 18 anos ou mais e seguir as orientações de segurança que fornecemos na retirada.",
  },
  {
    question: "Qual a autonomia da bateria das bikes elétricas?",
    answer:
      "O modelo GT20 tem autonomia de até 60km e o H9 de até 50km por carga completa, dependendo do terreno e do nível de assistência. Ideal para explorar Floripa o dia inteiro — da areia do Campeche ao asfalto da Beira-Mar.",
  },
  {
    question: "A Ekoa vende e-bikes novas em Florianópolis?",
    answer:
      "Sim! Trabalhamos com modelos novos das melhores marcas. Acesse nossa plataforma para conferir o catálogo completo, condições de pagamento e entrega em Florianópolis.",
  },
  {
    question: "E as bikes seminovas, como funciona?",
    answer:
      "Nossas bikes seminovas passam por revisão completa e são vendidas com garantia. É uma ótima opção para quem quer uma e-bike premium por um valor mais acessível em Florianópolis.",
  },
  {
    question: "O que é a plataforma Ekoa?",
    answer:
      "A Ekoa é a principal plataforma de mobilidade elétrica de Florianópolis: aluguel de e-bikes, venda de bikes novas e seminovas, além de conteúdo e comunidade para quem curte pedalar com estilo pela ilha.",
  },
  {
    question: "Posso alugar bike elétrica por mais de um dia?",
    answer:
      "Claro! Oferecemos planos diários, semanais e mensais com descontos progressivos. Quanto maior o período, melhor o valor. Confira as opções em app.ekoa.com.br.",
  },
];

const ChatSection = () => {
  return (
    <section id="faq" className="py-20 md:py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="uppercase tracking-[0.3em] text-xs font-medium text-muted-foreground mb-3 font-display">
            Dúvidas frequentes
          </p>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground leading-[0.95] mb-4">
            PERGUNTAS &<br />RESPOSTAS.
          </h2>
          <p className="text-muted-foreground">
            Tudo que você precisa saber antes de alugar sua e-bike.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-border">
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-primary hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-sm">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default ChatSection;
