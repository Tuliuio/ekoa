import { useEffect, useState } from "react"; // v2
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Bike, Plus, FileText, AlertCircle, CheckCircle, XCircle, CalendarDays } from "lucide-react";
import ekoaLogo from "@/assets/ekoa-logo.svg";
import RentalFlow from "@/components/RentalFlow";
import LanguageSelector from "@/components/LanguageSelector";
import UserDropdown from "@/components/UserDropdown";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getUserRoute } from "@/lib/auth";
import { useReservationRealtime } from "@/hooks/use-reservation-realtime";

const statusKeys: Record<string, { key: string; color: string; icon: any }> = {
  pending_docs: { key: "pending_docs", color: "bg-yellow-100 text-yellow-800", icon: FileText },
  under_review: { key: "under_review", color: "bg-blue-100 text-blue-800", icon: Clock },
  approved: { key: "approved", color: "bg-accent/20 text-accent-foreground", icon: CheckCircle },
  rejected: { key: "rejected", color: "bg-destructive/10 text-destructive", icon: XCircle },
  active: { key: "active", color: "bg-primary/10 text-primary", icon: Bike },
  completed: { key: "completed", color: "bg-muted text-muted-foreground", icon: CheckCircle },
  cancelled: { key: "cancelled", color: "bg-muted text-muted-foreground", icon: XCircle },
  pending: { key: "pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { key: "confirmed", color: "bg-accent/20 text-accent-foreground", icon: CheckCircle },
};

const paymentColors: Record<string, string> = {
  pending: "text-muted-foreground",
  invoiced: "text-yellow-600",
  paid: "text-accent-foreground",
  overdue: "text-destructive",
};

const Dashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRental, setShowRental] = useState(false);
  const navigate = useNavigate();
  const { user, authReady } = useAuthSession();
  const { t } = useTranslation();
  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      navigate("/", { replace: true });
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      try {
        const route = await getUserRoute(user.id);

        if (route === "/admin") {
          navigate(route, { replace: true });
          return;
        }

        const [profileRes, reservationsRes, spacesRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
          supabase.from("reservations").select("*, spaces(name, location, model_code, motor_power)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
          supabase.from("spaces").select("*").eq("is_active", true).limit(20),
        ]);

        if (profileRes.error) console.error("Erro ao carregar perfil", profileRes.error);
        if (reservationsRes.error) console.error("Erro ao carregar reservas", reservationsRes.error);
        if (spacesRes.error) console.error("Erro ao carregar bikes", spacesRes.error);

        if (profileRes.data) setProfile(profileRes.data);
        if (reservationsRes.data) setReservations(reservationsRes.data);
        if (spacesRes.data) setSpaces(spacesRes.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authReady, navigate, user]);

  // Real-time updates for reservations
  useReservationRealtime(user?.id, (updatedReservation) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === updatedReservation.id ? { ...r, ...updatedReservation } : r))
    );
  });


  if (showRental) {
    return (
      <RentalFlow
        bikes={spaces}
        userId={user?.id || null}
        onComplete={() => setShowRental(false)}
        onCancel={() => setShowRental(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-display">{t("common.loading")}</div>
      </div>
    );
  }

  const activeRentals = reservations.filter((r) => ["active", "approved"].includes(r.status));
  const pendingRentals = reservations.filter((r) => ["pending_docs", "under_review"].includes(r.status));

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="border-b border-border" style={{ background: 'linear-gradient(135deg, #0C2E22 0%, #12402F 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[56px] sm:h-[72px] flex items-center justify-between">
          <img src={ekoaLogo} alt="Ekoa" className="h-6 sm:h-8 brightness-0 invert" />
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSelector variant="dark" />
            {user && profile && (
              <UserDropdown
                user={user}
                profile={profile}
                onProfileUpdated={setProfile}
              />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase font-display">
              {t("dashboard.hello")}, {profile?.full_name?.split(" ")[0] || "rider"} 👋
            </h1>
            <p className="text-muted-foreground mt-1">{t("dashboard.subtitle")}</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              onClick={() => setShowRental(true)}
              variant="accent"
              size="lg"
              className="gap-2"
            >
              <Plus className="w-5 h-5" /> {t("nav.rent")}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[
            { label: t("dashboard.stats.active"), value: activeRentals.length, icon: Bike },
            { label: t("dashboard.stats.review"), value: pendingRentals.length, icon: Clock },
            { label: t("dashboard.stats.total"), value: reservations.length, icon: Calendar },
            { label: t("dashboard.stats.available"), value: spaces.length, icon: MapPin },
          ].map((stat) => (
            <Card key={stat.label} className="hover:translate-y-0">
              <CardContent className="p-3 sm:p-6 flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <stat.icon className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold font-display">{stat.value}</p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground leading-tight">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active / Pending Alert */}
        {pendingRentals.length > 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50 hover:translate-y-0">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
              <p className="text-sm text-yellow-800">
                {t("dashboard.pendingAlert", { count: pendingRentals.length })}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Reservations list */}
        <Card className="hover:translate-y-0 hover:shadow-sm">
          <CardHeader>
            <CardTitle className="uppercase tracking-wide text-lg">{t("dashboard.yourRentals")}</CardTitle>
            <CardDescription>{t("dashboard.yourRentalsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {reservations.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Bike className="w-20 h-20 mx-auto mb-4 opacity-15" />
                <p className="font-bold text-lg mb-1 font-display">{t("dashboard.empty")}</p>
                <p className="text-sm mb-6">{t("dashboard.emptyDesc")}</p>
                <Button
                  onClick={() => setShowRental(true)}
                  variant="accent"
                >
                  <Plus className="w-4 h-4 mr-2" /> {t("dashboard.rentNow")}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {reservations.map((res) => {
                  const cfg = statusKeys[res.status] || statusKeys.pending;
                  const payColor = paymentColors[res.payment_status] || paymentColors.pending;
                  return (
                    <div key={res.id} className="flex flex-col p-3 sm:p-4 rounded-2xl border border-border hover:bg-secondary/30 transition-all duration-200 gap-3">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-xl flex items-center justify-center shrink-0">
                          <Bike className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground/40" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold font-display text-sm sm:text-base truncate">{res.spaces?.name || "E-bike"} <span className="text-xs text-muted-foreground font-normal">{res.spaces?.motor_power}</span></p>
                          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <CalendarDays className="w-3 h-3 shrink-0" />
                            {new Date(res.start_time).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} → {new Date(res.end_time).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                          </p>
                          {res.delivery_address && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 shrink-0" /> <span className="truncate">{res.delivery_neighborhood || res.delivery_address}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[0.625rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full font-display ${cfg.color}`}>
                          {t(`status.${cfg.key}`)}
                        </span>
                        {res.total_price && (
                          <div className="ml-auto text-right">
                            <p className="text-sm font-bold font-display">R$ {Number(res.total_price).toFixed(2)}</p>
                            <p className={`text-xs font-medium ${payColor}`}>{t(`payment.${res.payment_status || "pending"}`)}</p>
                          </div>
                        )}
                        {res.payment_link && res.payment_status !== "paid" && (
                          <a
                            href={res.payment_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[0.625rem] font-bold bg-accent text-accent-foreground px-3 py-1.5 rounded-full hover:brightness-95 transition-all uppercase tracking-widest font-display"
                            onClick={(e) => e.stopPropagation()}
                          >
                            💳 {t("dashboard.pay")}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
