import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Bike, CheckCircle, Clock, CreditCard, Eye,
  FileText, MapPin, User, XCircle, ShoppingBag, Share2, Building2, Users
} from "lucide-react";
import ekoaLogo from "@/assets/ekoa-logo.svg";
import LanguageSelector from "@/components/LanguageSelector";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminProducts from "@/components/AdminProducts";
import AdminPartners from "@/components/AdminPartners";
import AdminBikes from "@/components/AdminBikes";
import AdminUsers from "@/components/AdminUsers";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getUserRoute } from "@/lib/auth";

const KANBAN_COLUMNS = [
  { key: "under_review", label: "Análise", icon: Clock, color: "bg-blue-500", statuses: ["pending_docs", "under_review", "pending"] },
  { key: "approved", label: "Aprovada", icon: CheckCircle, color: "bg-green-500", statuses: ["approved", "confirmed"] },
  { key: "payment_pending", label: "Pagamento pendente", icon: CreditCard, color: "bg-yellow-500", statuses: ["payment_pending"] },
  { key: "active", label: "Ativo", icon: Bike, color: "bg-primary", statuses: ["active"] },
  { key: "completed", label: "Concluído", icon: CheckCircle, color: "bg-muted-foreground", statuses: ["completed", "cancelled", "rejected"] },
];

const statusLabels: Record<string, string> = {
  pending_docs: "Aguardando docs",
  under_review: "Em análise",
  approved: "Aprovada",
  rejected: "Recusada",
  active: "Ativa",
  completed: "Concluída",
  cancelled: "Cancelada",
  pending: "Pendente",
  confirmed: "Confirmada",
};

const paymentLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Aguardando", color: "text-muted-foreground" },
  invoiced: { label: "Cobrança enviada", color: "text-yellow-600" },
  paid: { label: "Pago", color: "text-green-600" },
  overdue: { label: "Atrasado", color: "text-destructive" },
};

const Admin = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [paymentLink, setPaymentLink] = useState("");
  const [activeView, setActiveView] = useState<"kanban" | "products" | "partners" | "bikes" | "users">("kanban");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, authReady } = useAuthSession();

  useEffect(() => {
    let cancelled = false;

    const checkAdmin = async () => {
      if (!authReady) return;
      if (cancelled) return;
      if (!user) {
        setLoading(false);
        navigate("/", { replace: true });
        return;
      }

      const route = await getUserRoute(user.id);
      if (cancelled) return;
      if (route !== "/admin") {
        setLoading(false);
        navigate("/dashboard", { replace: true });
        return;
      }

      setIsAdmin(true);
      fetchReservations();
    };

    checkAdmin();

    return () => {
      cancelled = true;
    };
  }, [authReady, navigate, user]);

  const fetchReservations = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("reservations")
        .select("*, spaces(name, model_code, motor_power), profiles:user_id(full_name, phone)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar reservas do admin", error);
        toast({ title: "Erro", description: error.message, variant: "destructive" });
      }

      if (data) setReservations(data);
    } finally {
      setLoading(false);
    }
  };

  const openDetails = async (reservation: any) => {
    setSelectedReservation(reservation);
    setPaymentLink(reservation.payment_link || "");
    const { data } = await supabase
      .from("user_documents")
      .select("*")
      .eq("reservation_id", reservation.id);
    setDocuments(data || []);
  };

  const updateStatus = async (id: string, status: string, documentStatus?: string) => {
    const updates: any = { status, updated_at: new Date().toISOString() };
    if (documentStatus) updates.document_status = documentStatus;
    const { error } = await supabase.from("reservations").update(updates).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Status atualizado" });
    setSelectedReservation(null);
    fetchReservations();
  };

  const updatePayment = async (id: string, paymentStatus: "pending" | "invoiced" | "paid" | "overdue") => {
    const { error } = await supabase.from("reservations")
      .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() } as any)
      .eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Pagamento atualizado" });
    fetchReservations();
    if (selectedReservation?.id === id) {
      setSelectedReservation({ ...selectedReservation, payment_status: paymentStatus });
    }
  };

  const deleteReservation = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta reserva? Esta ação não pode ser desfeita.")) return;
    const { error } = await supabase.from("reservations").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Reserva excluída" });
    setSelectedReservation(null);
    fetchReservations();
  };

  const getDocUrl = async (path: string) => {
    const { data } = await supabase.storage.from("documents").createSignedUrl(path, 600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border text-primary-foreground shrink-0" style={{ background: 'linear-gradient(135deg, #0C2E22 0%, #12402F 100%)' }}>
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 h-[56px] sm:h-[72px] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <img src={ekoaLogo} alt="Ekoa" className="h-6 sm:h-8 brightness-0 invert" />
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-0 uppercase tracking-wider text-[10px] sm:text-xs hidden sm:inline-flex">Admin</Badge>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant={activeView === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("kanban")}
              className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10 gap-1 text-xs px-2 sm:px-3 h-8"
            >
              <Bike className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">Aluguéis</span>
            </Button>
            <Button
              variant={activeView === "bikes" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("bikes")}
              className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10 gap-1 text-xs px-2 sm:px-3 h-8"
            >
              <Bike className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">Bikes</span>
            </Button>
            <Button
              variant={activeView === "products" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("products")}
              className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10 gap-1 text-xs px-2 sm:px-3 h-8"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">Produtos</span>
            </Button>
            <Button
              variant={activeView === "partners" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("partners")}
              className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10 gap-1 text-xs px-2 sm:px-3 h-8"
            >
              <Building2 className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">Parceiros</span>
            </Button>
            <Button
              variant={activeView === "users" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("users")}
              className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10 gap-1 text-xs px-2 sm:px-3 h-8"
            >
              <Users className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">Usuários</span>
            </Button>
            <div className="w-px h-5 bg-primary-foreground/20 mx-0.5 hidden sm:block" />
            <LanguageSelector variant="dark" />
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 px-2 h-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate("/"); }} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 px-2 h-8 text-xs">
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-6 h-full">
        {activeView === "bikes" ? (
          <AdminBikes />
        ) : activeView === "products" ? (
          <AdminProducts />
        ) : activeView === "partners" ? (
          <AdminPartners />
        ) : activeView === "users" ? (
          <AdminUsers />
        ) : (
          <>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight uppercase mb-4 sm:mb-6 font-display">Painel administrativo</h1>
          <div className="flex gap-3 sm:gap-4 h-[calc(100vh-140px)] sm:h-[calc(100vh-180px)] overflow-x-auto pb-4 -mx-1 px-1">
            {KANBAN_COLUMNS.map((col) => {
              const colReservations = reservations.filter((r) => col.statuses.includes(r.status));
              return (
                <div key={col.key} className="flex flex-col min-w-[240px] sm:min-w-[280px] w-[240px] sm:w-[280px] shrink-0">
                  {/* Column Header */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className={`w-3 h-3 rounded-full ${col.color}`} />
                    <span className="text-sm font-bold uppercase tracking-wider">{col.label}</span>
                    <Badge variant="secondary" className="ml-auto text-xs h-5 px-1.5">
                      {colReservations.length}
                    </Badge>
                  </div>
                  {/* Column Body */}
                  <ScrollArea className="flex-1 rounded-xl bg-muted/30 border border-border p-2">
                    <div className="space-y-2 pr-2">
                      {colReservations.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-8">Nenhuma reserva</p>
                      ) : (
                        colReservations.map((res) => (
                          <KanbanCard key={res.id} reservation={res} onClick={() => openDetails(res)} />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              );
            })}
          </div>
          </>
        )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
          {selectedReservation && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="uppercase tracking-wide">
                      {selectedReservation.spaces?.name || "Reserva"} — Detalhes
                    </DialogTitle>
                    <DialogDescription>
                      Solicitado em {new Date(selectedReservation.created_at).toLocaleDateString("pt-BR")}
                    </DialogDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 shrink-0"
                    onClick={() => {
                      const r = selectedReservation;
                      const startDate = new Date(r.start_time);
                      const endDate = new Date(r.end_time);
                      const fmtDate = (d: Date) => d.toLocaleDateString("pt-BR");
                      const fmtTime = (d: Date) => d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                      const lines = [
                        `🛵 *Reserva Ekoa — ${r.spaces?.name || "E-bike"}*`,
                        ``,
                        `👤 *Cliente:* ${r.profiles?.full_name || "—"}`,
                        r.profiles?.phone ? `📞 *Telefone:* ${r.profiles.phone}` : null,
                        ``,
                        `📅 *Período:* ${fmtDate(startDate)} → ${fmtDate(endDate)}`,
                        `⏰ *Horário entrega:* ${fmtTime(startDate)}`,
                        `⏰ *Horário devolução:* ${fmtTime(endDate)}`,
                        `💰 *Total:* R$ ${Number(r.total_price || 0).toFixed(2)}`,
                        ``,
                        `📍 *Endereço:* ${r.delivery_address || "—"}, ${r.delivery_neighborhood || "—"} — ${r.delivery_city || "Florianópolis"}`,
                        r.delivery_notes ? `📝 *Obs entrega:* ${r.delivery_notes}` : null,
                        r.notes ? `\n📋 *Info adicional:* ${r.notes}` : null,
                        r.payment_link ? `\n💳 *Link pagamento:* ${r.payment_link}` : null,
                        ``,
                        `📊 *Status:* ${statusLabels[r.status] || r.status}`,
                        `💳 *Pagamento:* ${paymentLabels[r.payment_status]?.label || "Aguardando"}`,
                      ].filter(Boolean).join("\n");
                      const url = `https://wa.me/?text=${encodeURIComponent(lines)}`;
                      window.open(url, "_blank");
                    }}
                  >
                    <Share2 className="w-4 h-4" /> Compartilhar
                  </Button>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cliente</p>
                    <p className="font-medium">{selectedReservation.profiles?.full_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Telefone</p>
                    <p className="font-medium">{selectedReservation.profiles?.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Período</p>
                    <p className="font-medium">
                      {new Date(selectedReservation.start_time).toLocaleDateString("pt-BR")} → {new Date(selectedReservation.end_time).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Horário de entrega</p>
                    <p className="font-medium">
                      {new Date(selectedReservation.start_time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Horário de devolução</p>
                    <p className="font-medium">
                      {new Date(selectedReservation.end_time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-bold text-primary">R$ {Number(selectedReservation.total_price || 0).toFixed(2)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Endereço de entrega</p>
                    <p className="font-medium">{selectedReservation.delivery_address}, {selectedReservation.delivery_neighborhood} — {selectedReservation.delivery_city}</p>
                    {selectedReservation.delivery_notes && <p className="text-xs text-muted-foreground mt-1">Obs: {selectedReservation.delivery_notes}</p>}
                  </div>
                  {selectedReservation.notes && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Informações adicionais</p>
                      <p className="font-medium text-sm">{selectedReservation.notes}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant="secondary" className="text-xs">{statusLabels[selectedReservation.status] || selectedReservation.status}</Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pagamento</p>
                    <span className={`text-sm font-medium ${paymentLabels[selectedReservation.payment_status]?.color || "text-muted-foreground"}`}>
                      {paymentLabels[selectedReservation.payment_status]?.label || "Aguardando"}
                    </span>
                  </div>
                  {selectedReservation.payment_link && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Link de pagamento</p>
                      <a href={selectedReservation.payment_link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline break-all">
                        {selectedReservation.payment_link}
                      </a>
                    </div>
                  )}
                </div>

                {/* Documents */}
                <div>
                  <p className="font-semibold mb-2">Documentos enviados</p>
                  {documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum documento enviado.</p>
                  ) : (
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{doc.document_type === "rg_cnh" ? "RG/CNH" : doc.document_type === "selfie" ? "Selfie" : "Comprovante"}</p>
                              <p className="text-xs text-muted-foreground">{doc.file_name}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => getDocUrl(doc.file_path)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-border space-y-3">
                  <p className="font-semibold text-sm">Ações</p>
                  <div className="flex flex-wrap gap-2">
                    {["under_review", "pending_docs", "pending"].includes(selectedReservation.status) && (
                      <>
                        <Button size="sm" onClick={() => updateStatus(selectedReservation.id, "approved", "approved")} className="bg-green-600 hover:bg-green-700 text-white gap-1">
                          <CheckCircle className="w-4 h-4" /> Aprovar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(selectedReservation.id, "rejected", "rejected")} className="gap-1">
                          <XCircle className="w-4 h-4" /> Recusar
                        </Button>
                      </>
                    )}
                    {selectedReservation.status === "approved" && (
                      <div className="w-full space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold uppercase tracking-wider">Link de pagamento</Label>
                          <Input
                            value={paymentLink}
                            onChange={(e) => setPaymentLink(e.target.value)}
                            placeholder="https://pay.exemplo.com/..."
                            className="h-10"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!paymentLink.trim()}
                          onClick={async () => {
                            const { error } = await supabase.from("reservations")
                              .update({ payment_status: "invoiced", payment_link: paymentLink, status: "confirmed" as any, updated_at: new Date().toISOString() } as any)
                              .eq("id", selectedReservation.id);
                            if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
                            toast({ title: "Cobrança enviada!", description: "O link de pagamento está disponível no painel do cliente." });
                            setPaymentLink("");
                            setSelectedReservation(null);
                            fetchReservations();
                          }}
                          className="gap-1"
                        >
                          <CreditCard className="w-4 h-4" /> Enviar cobrança
                        </Button>
                      </div>
                    )}
                    {["approved", "confirmed"].includes(selectedReservation.status) && selectedReservation.payment_status === "paid" && (
                      <Button size="sm" onClick={() => updateStatus(selectedReservation.id, "active")} className="bg-primary hover:bg-primary/90 gap-1">
                        <Bike className="w-4 h-4" /> Marcar como ativo
                      </Button>
                    )}
                    {selectedReservation.payment_status === "invoiced" && (
                      <Button size="sm" variant="outline" onClick={() => updatePayment(selectedReservation.id, "paid")} className="gap-1 text-green-600 border-green-200 hover:bg-green-50">
                        <CheckCircle className="w-4 h-4" /> Confirmar pagamento
                      </Button>
                    )}
                    {selectedReservation.status === "active" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(selectedReservation.id, "completed")} className="gap-1">
                        <CheckCircle className="w-4 h-4" /> Finalizar aluguel
                      </Button>
                    )}
                    {["rejected", "cancelled"].includes(selectedReservation.status) && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(selectedReservation.id, "under_review")} className="gap-1">
                        <Clock className="w-4 h-4" /> Reabrir análise
                      </Button>
                    )}
                  </div>
                  {/* Delete */}
                  <div className="pt-3 border-t border-border">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 w-full"
                      onClick={() => deleteReservation(selectedReservation.id)}
                    >
                      <XCircle className="w-4 h-4" /> Excluir reserva
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const KanbanCard = ({ reservation, onClick }: { reservation: any; onClick: () => void }) => {
  const payCfg = paymentLabels[reservation.payment_status] || paymentLabels.pending;
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border-border"
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{reservation.profiles?.full_name || "Cliente"}</p>
            <p className="text-xs text-muted-foreground truncate">{reservation.profiles?.phone || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Bike className="w-3 h-3 shrink-0" />
          <span className="truncate">{reservation.spaces?.name || "E-bike"}</span>
          {reservation.spaces?.motor_power && (
            <span className="text-muted-foreground/60">• {reservation.spaces.motor_power}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3 shrink-0" />
          <span>
            {new Date(reservation.start_time).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} → {new Date(reservation.end_time).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
          </span>
        </div>
        {reservation.delivery_neighborhood && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{reservation.delivery_neighborhood}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <span className="text-sm font-bold">R$ {Number(reservation.total_price || 0).toFixed(2)}</span>
          <span className={`text-xs font-medium ${payCfg.color}`}>{payCfg.label}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default Admin;
