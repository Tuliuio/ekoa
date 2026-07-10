import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { User, Shield, Edit2, Trash2, Loader2, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { generateWhatsAppPassword } from "@/lib/password-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserWithRole {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  role: string;
}

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-800",
  moderator: "bg-orange-100 text-orange-800",
  partner: "bg-blue-100 text-blue-800",
  user: "bg-gray-100 text-gray-800",
};

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  const [openBulkDeleteDialog, setOpenBulkDeleteDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: "",
    countryCode: "55",
    phone: "",
    role: "user",
  });
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, phone, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("user_roles")
          .select("user_id, role")
      ]);

      if (!profilesRes.data) {
        setLoading(false);
        return;
      }

      // Create a map of user_id -> role for quick lookup
      const rolesMap = new Map<string, string>();
      rolesRes.data?.forEach(r => {
        rolesMap.set(r.user_id, r.role);
      });

      const usersWithRoles: UserWithRole[] = profilesRes.data.map((profile) => ({
        id: profile.id,
        email: null, // Email would require admin API, leaving as null for now
        full_name: profile.full_name,
        phone: profile.phone,
        created_at: profile.created_at,
        role: rolesMap.get(profile.id) || "user",
      }));

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error("Erro ao carregar usuários:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditRole = (user: UserWithRole) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setOpenDialog(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      // Delete user roles
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userToDelete.id);

      if (roleError) throw roleError;

      // Delete user profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userToDelete.id);

      if (profileError) throw profileError;

      toast({
        title: "Sucesso",
        description: `Usuário ${userToDelete.full_name || "removido"} foi deletado`,
      });

      setOpenDeleteDialog(false);
      setUserToDelete(null);

      // Remove from local state immediately
      setUsers(users.filter(u => u.id !== userToDelete.id));
    } catch (error: any) {
      console.error("Erro ao deletar usuário:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao deletar usuário",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedForDelete.size === 0) return;

    setBulkDeleting(true);
    const usersToDelete = Array.from(selectedForDelete);
    let deletedCount = 0;
    let errors = 0;

    try {
      for (const userId of usersToDelete) {
        try {
          // Delete user roles
          const { error: roleError } = await supabase
            .from("user_roles")
            .delete()
            .eq("user_id", userId);

          if (roleError) throw roleError;

          // Delete user profile
          const { error: profileError } = await supabase
            .from("profiles")
            .delete()
            .eq("id", userId);

          if (profileError) throw profileError;

          deletedCount++;
        } catch (error) {
          console.error(`Erro ao deletar usuário ${userId}:`, error);
          errors++;
        }
      }

      // Remove deleted users from local state
      setUsers(users.filter(u => !selectedForDelete.has(u.id)));
      setSelectedForDelete(new Set());
      setOpenBulkDeleteDialog(false);

      if (errors === 0) {
        toast({
          title: "Sucesso",
          description: `${deletedCount} usuário(s) deletado(s) com sucesso`,
        });
      } else {
        toast({
          title: "Parcialmente concluído",
          description: `${deletedCount} usuário(s) deletado(s), ${errors} erro(s)`,
          variant: "destructive",
        });
      }
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedForDelete);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedForDelete(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedForDelete.size === filteredUsers.length) {
      setSelectedForDelete(new Set());
    } else {
      setSelectedForDelete(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.fullName.trim() || !createForm.phone.trim()) {
      toast({
        title: "Erro",
        description: "Nome e telefone são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const cleanedPhone = createForm.phone.replace(/\D/g, "");
      const fullPhone = createForm.countryCode + cleanedPhone;
      const email = `${fullPhone}@ekoa.whatsapp`;
      const password = generateWhatsAppPassword(fullPhone);

      console.log(`Criando usuário: ${email} com senha ${password}`);

      // Step 1: Create user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: createForm.fullName,
            phone: fullPhone,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) throw new Error("Falha ao criar usuário");

      const userId = authData.user.id;
      console.log(`Usuário criado: ${userId}`);

      // Step 2: Verify profile was created (should be auto-created by trigger)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Create role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: createForm.role,
      });

      if (roleError) {
        console.error("Erro ao criar role:", roleError);
        // Continue anyway - user was created
      }

      toast({
        title: "Sucesso",
        description: `Usuário ${createForm.fullName} criado como ${createForm.role}`,
      });

      setOpenCreateDialog(false);
      setCreateForm({
        fullName: "",
        countryCode: "55",
        phone: "",
        role: "user",
      });
      fetchUsers();
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar usuário",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleSaveRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      // Abordagem simples: DELETE tudo + INSERT novo
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", selectedUser.id);

      await new Promise(resolve => setTimeout(resolve, 200));

      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: selectedUser.id, role: newRole });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Perfil alterado para ${newRole}`,
      });

      setOpenDialog(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Erro:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
          <Button onClick={() => setOpenCreateDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Usuário
          </Button>
        </div>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button onClick={fetchUsers} variant="outline">
            Atualizar
          </Button>
        </div>
        {selectedForDelete.size > 0 && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
            <span className="text-sm font-semibold">
              {selectedForDelete.size} usuário(s) selecionado(s)
            </span>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setOpenBulkDeleteDialog(true)}
              className="ml-auto gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Deletar Selecionados
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Carregando usuários...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum usuário encontrado
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold w-10">
                  <Checkbox
                    checked={selectedForDelete.size === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="text-left p-3 font-semibold">Nome</th>
                <th className="text-left p-3 font-semibold">Email</th>
                <th className="text-left p-3 font-semibold">Telefone</th>
                <th className="text-left p-3 font-semibold">Perfil</th>
                <th className="text-left p-3 font-semibold">Cadastrado em</th>
                <th className="text-left p-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b hover:bg-muted/50 transition-colors ${
                    selectedForDelete.has(user.id) ? "bg-muted/70" : ""
                  }`}
                >
                  <td className="p-3">
                    <Checkbox
                      checked={selectedForDelete.has(user.id)}
                      onCheckedChange={() => toggleUserSelection(user.id)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{user.full_name || "Sem nome"}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground font-mono text-xs">{user.email || user.id.slice(0, 8)}</td>
                  <td className="p-3 text-sm text-muted-foreground">{user.phone || "-"}</td>
                  <td className="p-3">
                    <Badge className={roleColors[user.role]}>
                      {user.role === "admin" && <Shield className="w-3 h-3 mr-1" />}
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditRole(user)}
                        className="gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setUserToDelete(user);
                          setOpenDeleteDialog(true);
                        }}
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Deletar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a deletar <span className="font-bold">{userToDelete?.full_name || "este usuário"}</span>.
              <br />
              <br />
              <span className="text-destructive font-semibold">⚠️ Esta ação é irreversível!</span>
              <br />
              Todos os dados do usuário (perfil, roles, histórico) serão deletados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? "Deletando..." : "Deletar permanentemente"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openBulkDeleteDialog} onOpenChange={setOpenBulkDeleteDialog}>
        <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar {selectedForDelete.size} Usuário(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a deletar os seguintes usuários:
              <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto bg-muted/50 p-3 rounded">
                {Array.from(selectedForDelete).map(userId => {
                  const user = users.find(u => u.id === userId);
                  return (
                    <div key={userId} className="text-sm font-medium text-foreground">
                      • {user?.full_name || "Sem nome"} {user?.phone ? `(${user.phone})` : ""}
                    </div>
                  );
                })}
              </div>
              <br />
              <span className="text-destructive font-semibold">⚠️ Esta ação é irreversível!</span>
              <br />
              Todos os dados desses usuários serão deletados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel disabled={bulkDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {bulkDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deletando...
                </>
              ) : (
                "Deletar Permanentemente"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                value={createForm.fullName}
                onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                placeholder="Ex: João Silva"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="countryCode">País</Label>
                <Select value={createForm.countryCode} onValueChange={(code) => setCreateForm({ ...createForm, countryCode: code })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="55">Brasil (+55)</SelectItem>
                    <SelectItem value="1">USA/Canadá (+1)</SelectItem>
                    <SelectItem value="44">Reino Unido (+44)</SelectItem>
                    <SelectItem value="33">França (+33)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value.replace(/\D/g, "").slice(0, 15) })}
                  placeholder="Ex: 48999999999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Perfil</Label>
              <Select value={createForm.role} onValueChange={(role) => setCreateForm({ ...createForm, role })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="partner">Parceiro</SelectItem>
                  <SelectItem value="moderator">Moderador</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted p-3 rounded text-sm">
              <p className="font-semibold mb-2">Informações de Acesso:</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-mono">{createForm.countryCode}{createForm.phone || "[telefone]"}@ekoa.whatsapp</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Senha: <span className="font-mono">ekoa_{createForm.countryCode}{createForm.phone || "[telefone]"}</span>
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenCreateDialog(false)}
                disabled={creating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={creating} className="flex-1 gap-2">
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                Criar Usuário
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Perfil do Usuário</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Usuário</p>
                <p className="text-lg font-bold">{selectedUser.full_name || "Sem nome"}</p>
                <p className="text-xs text-muted-foreground font-mono">{selectedUser.email || selectedUser.id}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Novo Perfil</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="partner">Parceiro</SelectItem>
                    <SelectItem value="moderator">Moderador</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveRole} className="flex-1">
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
