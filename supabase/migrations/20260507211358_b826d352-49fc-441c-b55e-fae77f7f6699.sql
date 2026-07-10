INSERT INTO public.reservations (user_id, space_id, partner_id, start_time, end_time, status, total_price, delivery_neighborhood, delivery_city, notes, payment_status, document_status)
VALUES (
  'f30ccb66-3d50-44db-9a83-f2371c2701b8',
  '32f91213-302e-462d-985e-63d0a988a38a',
  '71f63283-c3e3-44a5-9a82-e33c27e82f4e',
  now() + interval '2 days',
  now() + interval '5 days',
  'pending',
  477.00,
  'Centro',
  'Florianópolis',
  'Aluguel de teste criado pelo parceiro Pousada Teste',
  'pending',
  'pending'
);