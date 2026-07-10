
CREATE OR REPLACE FUNCTION public.notify_new_reservation_telegram()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _url text := 'https://njbswxvpxsijdgmtxvfw.supabase.co/functions/v1/notify-new-reservation';
BEGIN
  PERFORM net.http_post(
    url := _url,
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := jsonb_build_object('reservation_id', NEW.id)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_net;

DROP TRIGGER IF EXISTS trg_notify_new_reservation ON public.reservations;
CREATE TRIGGER trg_notify_new_reservation
AFTER INSERT ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.notify_new_reservation_telegram();
