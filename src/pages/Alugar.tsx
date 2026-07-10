import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import RentalFlow from "@/components/RentalFlow";
import { useTranslation } from "react-i18next";

const REFERRAL_KEY = "ekoa_referral_code";

const Alugar = () => {
  const [bikes, setBikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  // Capture ?ref=CODE and persist for later steps
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem(REFERRAL_KEY, ref.toUpperCase());
    }
  }, [searchParams]);

  useEffect(() => {
    supabase
      .from("spaces")
      .select("*")
      .eq("is_active", true)
      .limit(20)
      .then(({ data }) => {
        if (data) setBikes(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-display">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <RentalFlow
      bikes={bikes}
      userId={null}
      onComplete={() => navigate("/dashboard")}
      onCancel={() => navigate("/")}
    />
  );
};

export default Alugar;
