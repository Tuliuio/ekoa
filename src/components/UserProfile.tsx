import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface UserProfileProps {
  user: any;
  profile: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated?: (profile: any) => void;
}

const UserProfile = ({ user, profile, open, onOpenChange, onProfileUpdated }: UserProfileProps) => {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório", variant: "destructive" });
      return;
    }

    if (password && password.length < 6) {
      toast({ title: "Erro", description: "Senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }

    if (password && password !== confirmPassword) {
      toast({ title: "Erro", description: "Senhas não coincidem", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone || null,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update password if provided
      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password,
        });
        if (passwordError) throw passwordError;
      }

      toast({
        title: "Sucesso",
        description: password ? "Perfil e senha atualizados!" : "Perfil atualizado!",
      });

      // Refetch profile
      const { data: updatedProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (updatedProfile && onProfileUpdated) {
        onProfileUpdated(updatedProfile);
      }

      // Reset password fields
      setPassword("");
      setConfirmPassword("");

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+55 (48) 99999-9999"
            />
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold mb-4">Alterar Senha</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Deixe em branco para manter a senha atual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {password && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                  />
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive">❌ As senhas não coincidem</p>
                  )}
                  {password && confirmPassword && password === confirmPassword && (
                    <p className="text-xs text-accent-foreground">✅ Senhas coincidem</p>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Mínimo 6 caracteres
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfile;
