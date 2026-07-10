import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  Bike, Building2, Copy, DollarSign, FileText, LogOut, Share2, Users, Wallet,
} from "lucide-react";
import ekoaLogo from "@/assets/ekoa-logo.svg";
import LanguageSelector from "@/components/LanguageSelector";
import { useAuthSession } from "@/hooks/use-auth-session";

interface Partner {
  id: string;
  user_id: string | null;
  name: string;
  referral_code: string;
  commission_rate: number;
  email: string | null;
  phone: string | null;
  city: string | null;
  is_active: boolean;
}

interface Commission {
  id: string;
  reservation_id: string;
  reservation_total: number;
  commission_rate: number;
  commission_amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string | null;
  amount: number;
  file_url: string | null;
  issued_at: string;
  notes: string | null;
}

interface PartnerReservation {
  id: string;
  status: string;
  start_time: string;
  end_time: string;
  total_price: number | null;
  delivery_neighborhood: string | null;
  guest_name: string | null;
  bike_name: string | null;
}

const Partner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user, authReady } = useAuthSession();

  const [partner, setPartner] = useState<Partner | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reservations, setReservations] = useState<PartnerReservation[]>([]);
  const [activeRentals, setActiveRentals] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const sb = supabase as any;

        const { data: partnerData } = await sb
          .from("partners")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!partnerData) {
          setPartner(null);
          setLoading(false);
          return;
        }

        const p = partnerData as Partner;
        setPartner(p);

        const [commRes, invRes, activeRes, resRes] = await Promise.all([
          sb.from("partner_commissions").select("*").eq("partner_id", p.id).order("created_at", { ascending: false }),
          sb.from("partner_invoices").select("*").eq("partner_id", p.id).order("issued_at", { ascending: false }),
          sb.from("reservations").select("id", { count: "exact", head: true }).eq("partner_id", p.id).in("status", ["active", "approved", "confirmed"]),
          sb.from("reservations").select("id, status, start_time, end_time, total_price, delivery_neighborhood, user_id, space_id").eq("partner_id", p.id).order("start_time", { ascending: false }).limit(60),
        ]);

        setCommissions((commRes.data as Commission[]) || []);
        setInvoices((invRes.data as Invoice[]) || []);
        setActiveRentals(activeRes.count || 0);

        const rawRes = (resRes.data as any[]) || [];
        const userIds = Array.from(new Set(rawRes.map((r) => r.user_id).filter(Boolean)));
        const spaceIds = Array.from(new Set(rawRes.map((r) => r.space_id).filter(Boolean)));
        const [profilesRes, spacesRes] = await Promise.all([
          userIds.length ? sb.from("profiles").select("id, full_name").in("id", userIds) : Promise.resolve({ data: [] }),
          spaceIds.length ? sb.from("spaces").select("id, name").in("id", spaceIds) : Promise.resolve({ data: [] }),
        ]);
        const profilesMap = new Map<string, string>((profilesRes.data || []).map((p: any) => [p.id, p.full_name]));
        const spacesMap = new Map<string, string>((spacesRes.data || []).map((s: any) => [s.id, s.name]));
        setReservations(rawRes.map((r) => ({
          id: r.id,
          status: r.status,
          start_time: r.start_time,
          end_time: r.end_time,
          total_price: r.total_price,
          delivery_neighborhood: r.delivery_neighborhood,
          guest_name: profilesMap.get(r.user_id) || null,
          bike_name: spacesMap.get(r.space_id) || null,
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authReady, navigate, user]);

  const stats = useMemo(() => {
    const totalEarned = commissions.reduce((sum, c) => sum + Number(c.commission_amount), 0);
    const balance = commissions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + Number(c.commission_amount), 0);
    return { totalEarned, balance, totalReferrals: commissions.length };
  }, [commissions]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const referralLink = partner ? `${window.location.origin}/alugar?ref=${partner.referral_code}` : "";

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast({ title: t("partner.linkCopied") });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-display">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="border-b border-border" style={{ background: "linear-gradient(135deg, #0C2E22 0%, #12402F 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[56px] sm:h-[72px] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={ekoaLogo} alt="Ekoa" className="h-6 sm:h-8 brightness-0 invert" />
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-0 uppercase tracking-wider text-[10px] sm:text-xs hidden sm:inline-flex">
              {t("nav.partner")}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector variant="dark" />
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 shrink-0">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">
        {!partner ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
              <p className="text-muted-foreground">{t("partner.noProfile")}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase font-display">
                {t("partner.title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {partner.name} — {t("partner.subtitle")}
              </p>
            </div>

            {/* Referral box */}
            <Card className="mb-6 border-primary/20 bg-primary/5 hover:translate-y-0">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground font-display mb-1">
                      {t("partner.myCode")}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold font-display tracking-wider text-primary">
                      {partner.referral_code}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 break-all">{referralLink}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <Button onClick={copyLink} variant="outline" className="gap-2">
                      <Copy className="w-4 h-4" /> {t("partner.copyLink")}
                    </Button>
                    <Button
                      onClick={() => navigate(`/alugar?ref=${partner.referral_code}`)}
                      variant="accent"
                      className="gap-2"
                    >
                      <Bike className="w-4 h-4" /> {t("partner.rentForGuest", "Alugar pelo hóspede")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
              {[
                { label: t("partner.stats.balance"), value: `R$ ${stats.balance.toFixed(2)}`, icon: Wallet, accent: true },
                { label: t("partner.stats.totalEarned"), value: `R$ ${stats.totalEarned.toFixed(2)}`, icon: DollarSign },
                { label: t("partner.stats.activeRentals"), value: activeRentals, icon: Bike },
                { label: t("partner.stats.totalReferrals"), value: stats.totalReferrals, icon: Users },
              ].map((s) => (
                <Card key={s.label} className="hover:translate-y-0">
                  <CardContent className="p-3 sm:p-6 flex items-center gap-2 sm:gap-3">
                    <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 ${s.accent ? "bg-accent/30" : "bg-primary/10"}`}>
                      <s.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${s.accent ? "text-accent-foreground" : "text-primary"}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base sm:text-2xl font-bold font-display truncate">{s.value}</p>
                      <p className="text-[10px] sm:text-sm text-muted-foreground leading-tight">{s.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Rentals overview by status */}
            <Card className="mb-6 hover:translate-y-0 hover:shadow-sm">
              <CardHeader>
                <CardTitle className="uppercase tracking-wide text-lg flex items-center gap-2">
                  <Bike className="w-5 h-5" /> {t("partner.rentalsTitle")}
                </CardTitle>
                <CardDescription>{t("partner.rentalsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: "review", label: t("partner.rentalReview"), statuses: ["pending", "pending_docs", "under_review"], tone: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300" },
                    { key: "active", label: t("partner.rentalActive"), statuses: ["approved", "confirmed", "active"], tone: "bg-primary/10 border-primary/30 text-primary" },
                    { key: "completed", label: t("partner.rentalCompleted"), statuses: ["completed", "cancelled", "rejected"], tone: "bg-muted text-muted-foreground border-border" },
                  ].map((col) => {
                    const items = reservations.filter((r) => col.statuses.includes(r.status));
                    return (
                      <div key={col.key} className="rounded-2xl border border-border bg-secondary/20 p-3">
                        <div className="flex items-center justify-between mb-3 px-1">
                          <p className="text-xs font-bold uppercase tracking-widest font-display">{col.label}</p>
                          <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
                        </div>
                        {items.length === 0 ? (
                          <p className="text-center text-xs text-muted-foreground py-6">{t("partner.noRentals")}</p>
                        ) : (
                          <div className="space-y-2">
                            {items.map((r) => (
                              <div key={r.id} className={`rounded-xl border p-3 bg-background transition-colors`}>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <p className="text-sm font-bold font-display truncate">{r.bike_name || "E-bike"}</p>
                                  <Badge variant="outline" className={`text-[9px] shrink-0 ${col.tone}`}>
                                    {t(`status.${r.status}`, r.status)}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  <span className="font-medium text-foreground">{t("partner.guest")}:</span> {r.guest_name || "—"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  <span className="font-medium text-foreground">{t("partner.period")}:</span>{" "}
                                  {new Date(r.start_time).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                                  {" → "}
                                  {new Date(r.end_time).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                                </p>
                                {r.total_price != null && (
                                  <p className="text-sm font-bold font-display text-primary mt-2">
                                    R$ {Number(r.total_price).toFixed(2)}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Commissions */}
            <Card className="mb-6 hover:translate-y-0 hover:shadow-sm">
              <CardHeader>
                <CardTitle className="uppercase tracking-wide text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" /> {t("partner.commissionsTitle")}
                </CardTitle>
                <CardDescription>{t("partner.commissionsDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {commissions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">{t("partner.noCommissions")}</p>
                ) : (
                  <div className="space-y-2">
                    {commissions.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-3 sm:p-4 rounded-2xl border border-border hover:bg-secondary/30 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground">
                            {new Date(c.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                          <p className="text-sm font-medium mt-0.5">
                            {t("partner.rentalValue")}: <span className="font-bold">R$ {Number(c.reservation_total).toFixed(2)}</span>
                            <span className="text-muted-foreground ml-2">({Number(c.commission_rate).toFixed(0)}%)</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base sm:text-lg font-bold font-display text-primary">
                            R$ {Number(c.commission_amount).toFixed(2)}
                          </p>
                          <Badge variant={c.status === "paid" ? "default" : "secondary"} className="text-[10px] uppercase">
                            {c.status === "paid" ? t("partner.paid") : t("partner.pending")}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoices */}
            <Card className="hover:translate-y-0 hover:shadow-sm">
              <CardHeader>
                <CardTitle className="uppercase tracking-wide text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" /> {t("partner.invoicesTitle")}
                </CardTitle>
                <CardDescription>{t("partner.invoicesDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">{t("partner.noInvoices")}</p>
                ) : (
                  <div className="space-y-2">
                    {invoices.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between p-3 sm:p-4 rounded-2xl border border-border hover:bg-secondary/30 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {inv.invoice_number || `NF #${inv.id.slice(0, 8)}`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(inv.issued_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="text-right shrink-0 flex items-center gap-3">
                          <p className="text-base font-bold font-display">R$ {Number(inv.amount).toFixed(2)}</p>
                          {inv.file_url && (
                            <a href={inv.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs font-bold uppercase tracking-wider font-display">
                              <Share2 className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default Partner;
