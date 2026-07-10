INSERT INTO public.reservations (
  user_id, space_id, start_time, end_time, status, total_price,
  delivery_address, delivery_neighborhood, delivery_city, delivery_notes,
  notes, payment_link, payment_status, document_status
)
SELECT
  user_id,
  'a43078c3-5b4f-435e-8046-3eca085a807c'::uuid AS space_id,
  start_time, end_time, status, total_price,
  delivery_address, delivery_neighborhood, delivery_city, delivery_notes,
  notes, payment_link, payment_status, document_status
FROM public.reservations
WHERE id = '1f98e448-84c0-41eb-b2d0-785c473c05a8';