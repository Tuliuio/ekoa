import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const applySession = (session: Session | null) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
      setAuthReady(true);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    supabase.auth.getSession()
      .then(({ data: { session } }) => applySession(session))
      .catch(() => {
        if (!isMounted) return;
        setUser(null);
        setAuthReady(true);
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, authReady };
};