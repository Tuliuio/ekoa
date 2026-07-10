import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bike, ShoppingBag, Zap, Wrench, Award, CalendarDays } from "lucide-react";
import ekoaLogo from "@/assets/ekoa-logo.svg";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  payment_link: string | null;
};

const categoryConfig: Record<string, { label: string; icon: any; description: string }> = {
  new_bike: { label: "Bikes Novas", icon: Bike, description: "E-bikes zero km com garantia de 1 ano" },
  used_bike: { label: "Seminovas", icon: Award, description: "E-bikes revisadas com certificado de inspeção Ekoa" },
  accessory: { label: "Acessórios", icon: ShoppingBag, description: "Equipe-se para pedalar com segurança e estilo" },
  service: { label: "Oficina & Manutenção", icon: Wrench, description: "Troca de pneu, revisões preventivas e reparos com técnicos especializados" },
};

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from("products").select("*").eq("is_active", true).order("price");
      // Storefront da Ekoa: oculta itens de seed da Sooly (o banco é compartilhado por ora).
      // Não altera o banco; remover esta linha ao migrar a Ekoa para um Supabase próprio.
      if (data) setProducts((data as Product[]).filter((p) => !/sooly/i.test(p.name)));
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const grouped = {
    new_bike: products.filter((p) => p.category === "new_bike"),
    used_bike: products.filter((p) => p.category === "used_bike"),
    accessory: products.filter((p) => p.category === "accessory"),
    service: products.filter((p) => p.category === "service"),
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border" style={{ background: "linear-gradient(135deg, #0C2E22 0%, #12402F 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[56px] sm:h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <img src={ekoaLogo} alt="Ekoa" className="h-6 sm:h-8 brightness-0 invert" />
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-0 uppercase tracking-wider text-[10px] sm:text-xs font-display">
              Loja
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 gap-1 sm:gap-2 text-xs sm:text-sm">
              Minha conta
            </Button>
            <Button variant="accent" size="sm" onClick={() => navigate("/dashboard")} className="gap-1 sm:gap-2 text-xs sm:text-sm font-bold">
              <CalendarDays className="w-4 h-4" /> Alugar
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 text-center" style={{ background: "linear-gradient(160deg, #7CE83C 0%, #34c46a 55%, #ffffff 100%)" }}>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight font-display" style={{ color: "#12402F" }}>
          Loja Ekoa
        </h1>
        <p className="mt-2 sm:mt-3 text-base sm:text-lg max-w-2xl mx-auto" style={{ color: "#0C2E22" }}>
          Bikes novas e seminovas, acessórios, oficina especializada e manutenção. E, se preferir experimentar antes, você também pode alugar por dia.
        </p>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground animate-pulse font-display">Carregando produtos...</div>
        ) : (
          <Tabs defaultValue="new_bike" className="w-full flex flex-col items-center">
            <TabsList className="mx-auto mb-8 h-auto sm:h-12 bg-muted rounded-2xl sm:rounded-full p-1 inline-flex flex-wrap sm:flex-nowrap gap-1">
              {Object.entries(categoryConfig).map(([key, cfg]) => (
                <TabsTrigger key={key} value={key} className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-display text-[10px] sm:text-xs uppercase tracking-wider font-bold px-3 sm:px-4 py-1.5 sm:py-2">
                  {cfg.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(categoryConfig).map(([key, cfg]) => (
              <TabsContent key={key} value={key}>
                <div className="text-center mb-8">
                  <cfg.icon className="w-10 h-10 mx-auto mb-2 text-primary" />
                  <p className="text-muted-foreground">{cfg.description}</p>
                </div>
                {grouped[key as keyof typeof grouped].length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground">Nenhum produto disponível nesta categoria.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {grouped[key as keyof typeof grouped].map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </main>
    </div>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const isBike = product.category === "new_bike" || product.category === "used_bike";

  return (
    <Card className="flex flex-col overflow-hidden">
      {/* Image placeholder */}
      <div className="h-48 bg-muted flex items-center justify-center" style={isBike ? { background: "linear-gradient(135deg, #0C2E22 0%, #12402F 100%)" } : {}}>
        {isBike ? (
          <Bike className="w-16 h-16 text-primary-foreground/30" />
        ) : (
          <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
        )}
      </div>

      <CardContent className="flex-1 flex flex-col p-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold font-display leading-tight">{product.name}</h3>
          <Badge variant="accent" className="shrink-0 whitespace-nowrap">
            {product.category === "new_bike" ? "Nova" : product.category === "used_bike" ? "Seminova" : product.category === "service" ? "Serviço" : "Acessório"}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
          {product.description}
        </p>

        <div className="flex items-end justify-between gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-display">Preço</p>
            <p className="text-2xl font-bold font-display text-primary">
              R$ {Number(product.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          {product.payment_link ? (
            <a href={product.payment_link} target="_blank" rel="noopener noreferrer">
              <Button variant="accent" size="sm" className="gap-2">
                <Zap className="w-4 h-4" /> Comprar
              </Button>
            </a>
          ) : (
            <Button variant="outline" size="sm" disabled className="gap-2">
              Em breve
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Shop;
