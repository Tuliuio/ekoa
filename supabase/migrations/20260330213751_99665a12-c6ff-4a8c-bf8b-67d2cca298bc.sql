
-- Insert sample e-bikes
INSERT INTO public.spaces (name, description, location, price_per_hour, capacity, model_code, motor_power, features, top_speed, battery_range, image_url, is_active)
VALUES 
  ('GT20', 'E-bike premium com motor potente e som Bluetooth integrado. Ideal para explorar a ilha com conforto e estilo.', 'Florianópolis', 35.00, 1, 'GT20', '1000W', ARRAY['Motor 1000W', 'Som Bluetooth Integrado', 'Freios Hidráulicos', 'Acionamento por Cartão'], '45 km/h', '80 km', NULL, true),
  ('H9', 'E-bike robusta com garupa para passageiro. Perfeita para passeios a dois pela ilha.', 'Florianópolis', 40.00, 2, 'H9', '1000W', ARRAY['Motor 1000W', 'Garupa para Passageiro', 'Freios Hidráulicos', 'Acionamento por Cartão'], '40 km/h', '70 km', NULL, true),
  ('X1 City', 'E-bike urbana compacta e ágil. Ideal para deslocamentos rápidos na cidade.', 'Florianópolis', 25.00, 1, 'X1', '500W', ARRAY['Motor 500W', 'Design Compacto', 'Freios a Disco', 'Painel Digital'], '35 km/h', '60 km', NULL, true);
