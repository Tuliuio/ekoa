CREATE TYPE public.product_category AS ENUM ('new_bike', 'used_bike', 'accessory');

CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  category product_category NOT NULL,
  image_url TEXT,
  payment_link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
ON public.products FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.products (name, description, price, category) VALUES
('Sooly City 250W', 'E-bike urbana com motor de 250W, bateria de lítio 36V 10Ah com autonomia de até 45km. Quadro em alumínio 6061, freios a disco hidráulicos Shimano, câmbio Shimano Altus 7v. Display LCD com 5 níveis de assistência. Peso: 22kg. Ideal para deslocamentos diários e passeios pela cidade. Garantia de 1 ano.', 5490, 'new_bike'),
('Sooly Adventure 500W', 'E-bike para trilhas e aventuras com motor traseiro de 500W, bateria removível 48V 13Ah com autonomia de até 60km. Suspensão dianteira com 100mm de curso, pneus 27.5" off-road, freios a disco hidráulicos 180mm. Display colorido com GPS integrado. Quadro reforçado em alumínio, peso: 25kg. Garantia de 1 ano.', 7990, 'new_bike'),
('Sooly Cargo E-Bike', 'E-bike cargueira com motor central de 500W Bafang, bateria 48V 17.5Ah com autonomia de até 70km. Capacidade de carga de 80kg no rack traseiro integrado. Freios a disco hidráulicos, câmbio Shimano Acera 8v, pneus 26" reforçados. Perfeita para entregas e transporte do dia a dia. Garantia de 1 ano.', 8990, 'new_bike'),
('Sooly City 250W — Seminova', 'E-bike urbana revisada com motor de 250W, bateria com 85% de capacidade original (autonomia ~38km). Quadro em alumínio sem riscos estruturais, freios a disco recém-ajustados, pneus novos. Inclui certificado de inspeção Sooly. Garantia de 6 meses.', 3490, 'used_bike'),
('Sooly Adventure 500W — Seminova', 'E-bike de aventura revisada com motor 500W em perfeito estado, bateria com 80% de capacidade (autonomia ~48km). Suspensão revisada, freios sangrados, corrente e cassete novos. Certificado de inspeção Sooly incluído. Garantia de 6 meses.', 5290, 'used_bike'),
('Capacete Sooly Urban', 'Capacete urbano certificado com design moderno e ventilação otimizada. Casco em ABS com EPS de alta densidade, forro removível e lavável. Luz LED traseira integrada recarregável via USB-C. Tamanhos M e L. Peso: 320g.', 289, 'accessory'),
('Cadeado Sooly Pro', 'Cadeado U-Lock em aço temperado 16mm com revestimento anti-risco. Resistente a corte com serra e alavanca. Inclui cabo de aço flexível de 1.2m. Suporte de fixação no quadro incluso. Certificação Sold Secure Gold.', 199, 'accessory'),
('Alforje Sooly Adventure', 'Par de alforjes laterais impermeáveis (IPX6) com capacidade total de 40L. Material: lona encerada 1000D com costuras seladas. Fixação rápida no rack traseiro. Faixas refletivas 3M. Bolsos internos organizadores e alça de transporte.', 349, 'accessory'),
('Kit Iluminação Sooly', 'Conjunto de farol dianteiro 800 lúmens + lanterna traseira 100 lúmens. LEDs Cree, 5 modos de iluminação. Bateria USB-C com autonomia de até 8h. Fixação rápida em silicone. Sensor de luz ambiente e sensor de frenagem. IPX5.', 229, 'accessory');