-- Trigger to auto-assign/remove 'partner' role based on partners.user_id
CREATE OR REPLACE FUNCTION public.sync_partner_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove role from old user when user_id changes or row deleted
  IF (TG_OP = 'DELETE') THEN
    IF OLD.user_id IS NOT NULL THEN
      DELETE FROM public.user_roles WHERE user_id = OLD.user_id AND role = 'partner';
    END IF;
    RETURN OLD;
  END IF;

  IF (TG_OP = 'UPDATE') AND OLD.user_id IS DISTINCT FROM NEW.user_id AND OLD.user_id IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = OLD.user_id AND role = 'partner';
  END IF;

  -- Add role to new user
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'partner')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_partner_role_ins ON public.partners;
CREATE TRIGGER trg_sync_partner_role_ins
AFTER INSERT ON public.partners
FOR EACH ROW EXECUTE FUNCTION public.sync_partner_role();

DROP TRIGGER IF EXISTS trg_sync_partner_role_upd ON public.partners;
CREATE TRIGGER trg_sync_partner_role_upd
AFTER UPDATE OF user_id ON public.partners
FOR EACH ROW EXECUTE FUNCTION public.sync_partner_role();

DROP TRIGGER IF EXISTS trg_sync_partner_role_del ON public.partners;
CREATE TRIGGER trg_sync_partner_role_del
AFTER DELETE ON public.partners
FOR EACH ROW EXECUTE FUNCTION public.sync_partner_role();