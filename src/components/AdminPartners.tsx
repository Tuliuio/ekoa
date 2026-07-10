import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Building2, Trash2 } from "lucide-react";

interface ProfileOption { id: string; full_name: string | null; }

interface Partner {
  id: string;
  user_id: string | null;
  name: string;
  referral_code: string;
  commission_rate: number;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

interface Commission {
  id: string;
  partner_id: string;
  reservation_id: string;
  reservation_total: number;
  commission_amount: number;
  status: string;
  created_at: string;
}

const sb = supabase as any;

const generateCode = () =>
  Math.random().toString(36).slice(2, 7).toUpperCase() +
  Math.floor(Math.random() * 100).toString().padStart(2, "0");

const AdminPartners = () => {
  const { toast } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [form, setForm] = useState({
    name: "",
    referral_code: "",
    commission_rate: 10,
    email: "",
    phone: "",
    user_id: "",
    is_active: true,
  });

  const fetchAll = async () => {
    setLoading(true);
    const [pRes, cRes, prRes] = await Promise.all([
      sb.from("partners").select("*").order("created_at", { ascending: false }),
      sb.from("partner_commissions").select("*").order("created_at", { ascending: false }),
      sb.from("profiles").select("id, full_name").order("full_name"),
    ]);
    setPartners((pRes.data as Partner[]) || []);
    setCommissions((cRes.data as Commission[]) || []);
    setProfiles((prRes.data as ProfileOption[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({
      name: "",
      referral_code: generateCode(),
      commission_rate: 10,
      email: "",
      phone: "",
      user_id: "",
      is_active: true,
    });
    setOpen(true);
  };

  const openEdit = (p: Partner) => {
    setEditing(p);
    setForm({
      name: p.name,
      referral_code: p.referral_code,
      commission_rate: Number(p.commission_rate),
      email: p.email || "",
      phone: p.phone || "",
      user_id: p.user_id || "",
      is_active: p.is_active,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.referral_code.trim()) {
      toast({ title: "Nome e código são obrigatórios", variant: "destructive" });
      return;
    }
    const payload = {
      name: form.name.trim(),
      referral_code: form.referral_code.trim().toUpperCase(),
      commission_rate: Number(form.commission_rate) || 10,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      user_id: form.user_id.trim() || null,
      is_active: form.is_active,
    };

    const { error } = editing
      ? await sb.from("partners").update(payload).eq("id", editing.id)
      : await sb.from("partners").insert(payload);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editing ? "Parceiro atualizado" : "Parceiro criado" });
    setOpen(false);
    fetchAll();
  };

  const remove = async (p: Partner) => {
    if (!confirm(`Excluir parceiro "${p.name}"? Comissões e notas associadas serão removidas.`)) return;
    const { error } = await sb.from("partners").delete().eq("id", p.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Parceiro excluído" });
    fetchAll();
  };

  const markCommissionPaid = async (c: Commission) => {
    const { error } = await sb
      .from("partner_commissions")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", c.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Comissão marcada como paga" });
    fetchAll();
  };

  const partnerCommissions = (id: string) => commissions.filter((c) => c.partner_id === id);

  if (loading) {
    return <div className="text-muted-foreground py-8 text-center">Carregando parceiros...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight font-display flex items-center gap-2">
            <Building2 className="w-6 h-6" /> Parceiros
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pousadas e hotéis que indicam a Ekoa e recebem comissão por reserva paga.
          </p>
        </div>
        <Button onClick={openNew} variant="accent" className="gap-2">
          <Plus className="w-4 h-4" /> Novo parceiro
        </Button>
      </div>

      {partners.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
            Nenhum parceiro cadastrado.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {partners.map((p) => {
            const cs = partnerCommissions(p.id);
            const total = cs.reduce((sum, c) => sum + Number(c.commission_amount), 0);
            const pending = cs.filter((c) => c.status === "pending").reduce((sum, c) => sum + Number(c.commission_amount), 0);
            return (
              <Card key={p.id} className="hover:translate-y-0">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{p.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Código: <span className="font-mono font-bold text-primary">{p.referral_code}</span> · {Number(p.commission_rate).toFixed(0)}%
                      </CardDescription>
                    </div>
                    <Badge variant={p.is_active ? "default" : "secondary"} className="shrink-0 text-[10px]">
                      {p.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-muted/40 p-2">
                      <p className="text-muted-foreground">Total ganho</p>
                      <p className="font-bold font-display text-sm">R$ {total.toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg bg-accent/20 p-2">
                      <p className="text-muted-foreground">A pagar</p>
                      <p className="font-bold font-display text-sm">R$ {pending.toFixed(2)}</p>
                    </div>
                  </div>
                  {cs.filter((c) => c.status === "pending").length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Pendentes</p>
                      {cs.filter((c) => c.status === "pending").slice(0, 3).map((c) => (
                        <button
                          key={c.id}
                          onClick={() => markCommissionPaid(c)}
                          className="w-full text-left text-xs p-2 rounded-lg border hover:bg-accent/10 transition-colors flex justify-between items-center gap-2"
                        >
                          <span className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString("pt-BR")}</span>
                          <span className="font-bold">R$ {Number(c.commission_amount).toFixed(2)}</span>
                          <Badge className="text-[9px] h-4">marcar pago</Badge>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(p)}>
                      <Edit className="w-3.5 h-3.5" /> Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(p)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar parceiro" : "Novo parceiro"}</DialogTitle>
            <DialogDescription>
              Cadastre uma pousada ou hotel parceiro. O código é usado em /alugar?ref=CODIGO.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Pousada do Mar" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Código *</Label>
                <Input
                  value={form.referral_code}
                  onChange={(e) => setForm({ ...form, referral_code: e.target.value.toUpperCase() })}
                  className="font-mono uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Comissão (%)</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={form.commission_rate}
                  onChange={(e) => setForm({ ...form, commission_rate: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Usuário vinculado</Label>
              <Select
                value={form.user_id || "none"}
                onValueChange={(v) => setForm({ ...form, user_id: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar usuário (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Nenhum —</SelectItem>
                  {profiles.map((pr) => (
                    <SelectItem key={pr.id} value={pr.id}>
                      {pr.full_name || pr.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                Selecione a conta do parceiro. A role "partner" será atribuída automaticamente.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              <Label htmlFor="active" className="font-normal cursor-pointer">
                Ativo
              </Label>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="accent" onClick={save}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPartners;
