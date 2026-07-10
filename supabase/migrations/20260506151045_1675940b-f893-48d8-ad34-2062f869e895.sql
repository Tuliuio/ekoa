CREATE POLICY "Partners view own reservations"
ON public.reservations
FOR SELECT
TO authenticated
USING (
  partner_id IN (
    SELECT id FROM public.partners WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Partners view spaces of own reservations"
ON public.spaces
FOR SELECT
TO authenticated
USING (is_active = true);