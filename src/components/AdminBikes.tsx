import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit2, Plus } from "lucide-react";

interface Bike {
  id: string;
  name: string;
  model_code: string;
  motor_power: string;
  top_speed: string;
  battery_range: string;
  price_per_hour: number;
  is_active: boolean;
  owner_name: string | null;
}

interface BikeFormData {
  name: string;
  model_code: string;
  motor_power: string;
  top_speed: string;
  battery_range: string;
  price_per_hour: number;
  is_active: boolean;
  owner_name: string;
}

const AdminBikes = () => {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<BikeFormData>({
    name: "",
    model_code: "",
    motor_power: "",
    top_speed: "",
    battery_range: "",
    price_per_hour: 0,
    is_active: true,
    owner_name: "",
  });

  const fetchBikes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("spaces")
        .select("*")
        .order("name");

      if (error) throw error;
      setBikes(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar bikes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBikes();
  }, []);

  const handleAddNew = () => {
    setFormData({
      name: "",
      model_code: "",
      motor_power: "",
      top_speed: "",
      battery_range: "",
      price_per_hour: 0,
      is_active: true,
      owner_name: "",
    });
    setEditingId(null);
    setOpenDialog(true);
  };

  const handleEdit = (bike: Bike) => {
    setFormData({
      name: bike.name,
      model_code: bike.model_code,
      motor_power: bike.motor_power,
      top_speed: bike.top_speed,
      battery_range: bike.battery_range,
      price_per_hour: bike.price_per_hour,
      is_active: bike.is_active,
      owner_name: bike.owner_name || "",
    });
    setEditingId(bike.id);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.model_code.trim()) {
      toast({
        title: "Erro",
        description: "Nome e Modelo são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from("spaces")
          .update(formData)
          .eq("id", editingId);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Bike atualizada com sucesso",
        });
      } else {
        const { error } = await supabase.from("spaces").insert([formData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Bike criada com sucesso",
        });
      }

      setOpenDialog(false);
      fetchBikes();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar bike",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que quer deletar esta bike?")) return;

    try {
      const { error } = await supabase.from("spaces").delete().eq("id", id);

      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Bike deletada com sucesso",
      });
      fetchBikes();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar bike",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (bike: Bike) => {
    try {
      const { error } = await supabase
        .from("spaces")
        .update({ is_active: !bike.is_active })
        .eq("id", bike.id);

      if (error) throw error;
      fetchBikes();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Bikes</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Bike
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Bike" : "Nova Bike"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: E-Bike GT20"
                />
              </div>
              <div>
                <Label>Modelo (Código)</Label>
                <Input
                  value={formData.model_code}
                  onChange={(e) =>
                    setFormData({ ...formData, model_code: e.target.value })
                  }
                  placeholder="Ex: gt20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Potência do Motor</Label>
                  <Input
                    value={formData.motor_power}
                    onChange={(e) =>
                      setFormData({ ...formData, motor_power: e.target.value })
                    }
                    placeholder="Ex: 250W"
                  />
                </div>
                <div>
                  <Label>Velocidade Máxima</Label>
                  <Input
                    value={formData.top_speed}
                    onChange={(e) =>
                      setFormData({ ...formData, top_speed: e.target.value })
                    }
                    placeholder="Ex: 25 km/h"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Autonomia da Bateria</Label>
                  <Input
                    value={formData.battery_range}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        battery_range: e.target.value,
                      })
                    }
                    placeholder="Ex: 100 km"
                  />
                </div>
                <div>
                  <Label>Preço/Hora (R$)</Label>
                  <Input
                    type="number"
                    value={formData.price_per_hour}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price_per_hour: parseFloat(e.target.value),
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <Label>Responsável (Dono)</Label>
                <Input
                  value={formData.owner_name}
                  onChange={(e) =>
                    setFormData({ ...formData, owner_name: e.target.value })
                  }
                  placeholder="Ex: Lucas, Pousada Bolté, Ricardo, Tom"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label>
                  {formData.is_active ? "Disponível" : "Indisponível"}
                </Label>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  {editingId ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bikes.map((bike) => (
            <div
              key={bike.id}
              className="border rounded-lg p-4 space-y-3 bg-card"
            >
              <div>
                <h3 className="font-bold text-lg">{bike.name}</h3>
                <p className="text-sm text-gray-600">{bike.model_code}</p>
              </div>

              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Motor:</span> {bike.motor_power}
                </p>
                <p>
                  <span className="font-semibold">Velocidade:</span>{" "}
                  {bike.top_speed}
                </p>
                <p>
                  <span className="font-semibold">Autonomia:</span>{" "}
                  {bike.battery_range}
                </p>
                <p>
                  <span className="font-semibold">Preço:</span> R${" "}
                  {bike.price_per_hour.toFixed(2)}/h
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Responsável:</Label>
                  <span className="text-sm font-semibold text-primary">
                    {bike.owner_name || "Sem dono"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Label className="text-sm">Status:</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={bike.is_active}
                      onCheckedChange={() => handleToggleActive(bike)}
                    />
                    <span className="text-sm font-semibold">
                      {bike.is_active ? "🟢 Disponível" : "🔴 Indisponível"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(bike)}
                  className="flex-1 gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(bike.id)}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBikes;
