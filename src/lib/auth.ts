import { supabase } from "@/integrations/supabase/client";

export const getUserRoute = async (userId: string) => {
  // Check admin first
  const { data: isAdmin, error: adminErr } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });

  if (adminErr) {
    console.error("Erro ao verificar perfil de acesso", adminErr);
    return "/dashboard";
  }
  if (isAdmin) return "/admin";

  // Then partner
  const { data: isPartner } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "partner" as any,
  });
  if (isPartner) return "/partner";

  return "/dashboard";
};
