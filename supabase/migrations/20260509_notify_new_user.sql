-- Create notification function for new users
CREATE OR REPLACE FUNCTION public.notify_new_user_telegram()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _url text := 'https://njbswxvpxsijdgmtxvfw.supabase.co/functions/v1/notify-new-user';
BEGIN
  PERFORM net.http_post(
    url := _url,
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := jsonb_build_object('user_id', NEW.id)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

-- Create trigger for new users
DROP TRIGGER IF EXISTS trg_notify_new_user ON public.profiles;
CREATE TRIGGER trg_notify_new_user
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.notify_new_user_telegram();
