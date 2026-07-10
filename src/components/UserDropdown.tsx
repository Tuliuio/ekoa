import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import UserProfile from "./UserProfile";
import { User, Settings, LogOut } from "lucide-react";

interface UserDropdownProps {
  user: any;
  profile: any;
  onProfileUpdated?: (profile: any) => void;
}

const UserDropdown = ({ user, profile, onProfileUpdated }: UserDropdownProps) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full flex items-center gap-2 h-10 px-3 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs font-semibold text-primary-foreground">
              {getInitials(profile?.full_name)}
            </div>
            <span className="text-sm hidden sm:inline max-w-[120px] truncate">
              {profile?.full_name?.split(" ")[0] || "Usuário"}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col">
            <span className="font-semibold">{profile?.full_name || "Usuário"}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setProfileOpen(true)} className="gap-2 cursor-pointer">
            <Settings className="w-4 h-4" />
            <span>Editar Perfil</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-destructive">
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserProfile
        user={user}
        profile={profile}
        open={profileOpen}
        onOpenChange={setProfileOpen}
        onProfileUpdated={onProfileUpdated}
      />
    </>
  );
};

export default UserDropdown;
