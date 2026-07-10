import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Bike, Edit, Plus, Settings, ShoppingBag, Trash2, Wrench } from "lucide-react";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  payment_link: string | null;
  is_active: boolean;
};

const categoryLabels: Record<string, string> = {
  new_bike: "Bike Nova",
  used_bike: "Seminova",
  accessory: "Acessório",
  service: "Serviço",
};

const categoryIcons: Record<string, any> = {
  new_bike: Bike,
  used_bike: Wrench,
  accessory: ShoppingBag,
  service: Settings,
};

const emptyProduct = {
  name: "",
  description: "",
  price: 0,
  category: "new_bike",
  image_url: "",
  payment_link: "",
  is_active: true,
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const { toast } = useToast();

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("category").order("price");
    if (data) setProducts(data as any);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSave = async () => {
    if (!editing?.name?.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório.", variant: "destructive" });
      return;
    }

    const payload = {
      name: editing.name,
      description: editing.description || null,
      price: Number(editing.price) || 0,
      category: editing.category || "new_bike",
      image_url: editing.image_url || null,
      payment_link: editing.payment_link || null,
      is_active: editing.is_active ?? true,
    };

    if (isNew) {
      const { error } = await supabase.from("products").insert(payload as any);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Produto criado!" });
    } else {
      const { error } = await supabase.from("products").update(payload as any).eq("id", editing.id!);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Produto atualizado!" });
    }

    setEditing(null);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Produto removido" });
    fetchProducts();
  };

  if (loading) return <div className="py-8 text-center text-muted-foreground animate-pulse">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold uppercase tracking-wider font-display">Produtos ({products.length})</h2>
        <Button size="sm" variant="accent" onClick={() => { setEditing({ ...emptyProduct }); setIsNew(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Novo produto
        </Button>
      </div>

      <div className="space-y-2">
        {products.map((p) => {
          const Icon = categoryIcons[p.category] || ShoppingBag;
          return (
            <Card key={p.id} className={`hover:translate-y-0 ${!p.is_active ? "opacity-50" : ""}`}>
              <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold font-display truncate text-sm sm:text-base">{p.name}</p>
                    {!p.is_active && <Badge variant="secondary" className="text-[0.5rem]">Inativo</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{categoryLabels[p.category]}</p>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="font-bold font-display text-primary">R$ {Number(p.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-muted-foreground">{p.payment_link ? "Link ativo" : "Sem link"}</p>
                </div>
                <div className="flex gap-0.5 sm:gap-1 shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditing({ ...p }); setIsNew(false); }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive h-8 w-8" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit / Create Dialog */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-wide font-display">{isNew ? "Novo produto" : "Editar produto"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={editing.category || "new_bike"} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_bike">Bike Nova</SelectItem>
                    <SelectItem value="used_bike">Seminova</SelectItem>
                    <SelectItem value="accessory">Acessório</SelectItem>
                    <SelectItem value="service">Serviço</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Preço (R$)</Label>
                <Input type="number" value={editing.price || 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={4} />
              </div>
              <div>
                <Label>Link de pagamento</Label>
                <Input value={editing.payment_link || ""} onChange={(e) => setEditing({ ...editing, payment_link: e.target.value })} placeholder="https://pay.exemplo.com/..." />
              </div>
              <div>
                <Label>URL da imagem</Label>
                <Input value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} id="active-check" className="rounded" />
                <label htmlFor="active-check" className="text-sm">Ativo na loja</label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} className="flex-1">{isNew ? "Criar" : "Salvar"}</Button>
                <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
