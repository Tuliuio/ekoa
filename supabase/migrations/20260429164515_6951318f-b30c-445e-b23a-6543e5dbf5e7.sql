-- ============ PARTNERS TABLE ============
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE,
  name TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  email TEXT,
  phone TEXT,
  city TEXT DEFAULT 'Florianópolis',
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage partners" ON public.partners
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Partners view own profile" ON public.partners
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Partners update own profile" ON public.partners
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Public function to validate referral code (returns boolean only, no data leak)
CREATE OR REPLACE FUNCTION public.validate_referral_code(_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.partners WHERE referral_code = upper(_code) AND is_active = true);
$$;

-- ============ RESERVATIONS: referral fields ============
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reservations_partner ON public.reservations(partner_id);

-- Trigger to auto-link partner_id when referral_code is set
CREATE OR REPLACE FUNCTION public.link_partner_from_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.referral_code IS NOT NULL AND NEW.partner_id IS NULL THEN
    SELECT id INTO NEW.partner_id
    FROM public.partners
    WHERE referral_code = upper(NEW.referral_code) AND is_active = true
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_link_partner_from_code ON public.reservations;
CREATE TRIGGER trg_link_partner_from_code
  BEFORE INSERT OR UPDATE OF referral_code ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.link_partner_from_code();

-- ============ COMMISSIONS TABLE ============
CREATE TABLE public.partner_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  reservation_total NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reservation_id)
);

ALTER TABLE public.partner_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage commissions" ON public.partner_commissions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Partners view own commissions" ON public.partner_commissions
  FOR SELECT TO authenticated
  USING (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  );

-- Auto-create commission when reservation marked as paid
CREATE OR REPLACE FUNCTION public.create_partner_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _rate NUMERIC(5,2);
BEGIN
  IF NEW.payment_status = 'paid'
     AND (OLD.payment_status IS DISTINCT FROM 'paid')
     AND NEW.partner_id IS NOT NULL
     AND NEW.total_price IS NOT NULL THEN

    SELECT commission_rate INTO _rate FROM public.partners WHERE id = NEW.partner_id;
    IF _rate IS NULL THEN _rate := 10.00; END IF;

    INSERT INTO public.partner_commissions
      (partner_id, reservation_id, reservation_total, commission_rate, commission_amount)
    VALUES
      (NEW.partner_id, NEW.id, NEW.total_price, _rate, ROUND(NEW.total_price * _rate / 100.0, 2))
    ON CONFLICT (reservation_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_partner_commission ON public.reservations;
CREATE TRIGGER trg_create_partner_commission
  AFTER UPDATE OF payment_status ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.create_partner_commission();

-- ============ INVOICES TABLE ============
CREATE TABLE public.partner_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  invoice_number TEXT,
  amount NUMERIC(10,2) NOT NULL,
  file_url TEXT,
  issued_at DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage invoices" ON public.partner_invoices
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Partners view own invoices" ON public.partner_invoices
  FOR SELECT TO authenticated
  USING (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  );

-- Timestamp triggers
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_partners_updated BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_commissions_updated BEFORE UPDATE ON public.partner_commissions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON public.partner_invoices
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();