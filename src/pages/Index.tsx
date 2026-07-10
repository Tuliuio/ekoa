import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, ArrowRight, Bike, Lock, Leaf, Globe } from "lucide-react";
import EkoaLogo from "@/components/EkoaLogo";
import LanguageSelector from "@/components/LanguageSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateWhatsAppPassword } from "@/lib/password-utils";

// Country codes list
const COUNTRY_CODES = [
  { code: "55", country: "Brasil", flag: "🇧🇷" },
  { code: "1", country: "USA/Canadá", flag: "🇺🇸" },
  { code: "44", country: "Reino Unido", flag: "🇬🇧" },
  { code: "33", country: "França", flag: "🇫🇷" },
  { code: "34", country: "Espanha", flag: "🇪🇸" },
  { code: "39", country: "Itália", flag: "🇮🇹" },
  { code: "49", country: "Alemanha", flag: "🇩🇪" },
  { code: "31", country: "Holanda", flag: "🇳🇱" },
  { code: "41", country: "Suíça", flag: "🇨🇭" },
  { code: "43", country: "Áustria", flag: "🇦🇹" },
  { code: "32", country: "Bélgica", flag: "🇧🇪" },
  { code: "46", country: "Suécia", flag: "🇸🇪" },
  { code: "47", country: "Noruega", flag: "🇳🇴" },
  { code: "45", country: "Dinamarca", flag: "🇩🇰" },
  { code: "358", country: "Finlândia", flag: "🇫🇮" },
  { code: "48", country: "Polônia", flag: "🇵🇱" },
  { code: "36", country: "Hungria", flag: "🇭🇺" },
  { code: "40", country: "Romênia", flag: "🇷🇴" },
  { code: "420", country: "República Tcheca", flag: "🇨🇿" },
  { code: "30", country: "Grécia", flag: "🇬🇷" },
  { code: "353", country: "Irlanda", flag: "🇮🇪" },
  { code: "61", country: "Austrália", flag: "🇦🇺" },
  { code: "64", country: "Nova Zelândia", flag: "🇳🇿" },
  { code: "81", country: "Japão", flag: "🇯🇵" },
  { code: "86", country: "China", flag: "🇨🇳" },
  { code: "91", country: "Índia", flag: "🇮🇳" },
  { code: "65", country: "Singapura", flag: "🇸🇬" },
  { code: "60", country: "Malásia", flag: "🇲🇾" },
];

const Index = () => {
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("55");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned;
  };

  const getPhoneMaxLength = (country: string) => {
    if (country === "55") return 11; // Brasil
    if (country === "1") return 10;  // EUA/Canadá
    return 15; // Padrão internacional
  };

  const formatPhoneDisplay = (value: string, country: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, getPhoneMaxLength(country));

    // Brasil: (XX) XXXXX-XXXX (11 dígitos)
    if (country === "55" && cleaned.length <= 11) {
      if (cleaned.length <= 2) return cleaned;
      if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }

    // EUA/Canadá: (XXX) XXX-XXXX (10 dígitos)
    if (country === "1" && cleaned.length <= 10) {
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    // Genérico: agrupar em 2-3-4
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)} ${cleaned.slice(9)}`;
  };


  const handleWhatsAppLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim()) {
      toast({ title: "Erro", description: "Digite seu número de WhatsApp", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phone);
      const fullPhone = countryCode + formattedPhone;
      const tempEmail = `${fullPhone}@ekoa.whatsapp`;
      const tempPassword = generateWhatsAppPassword(fullPhone);

      // STEP 1: Try to sign in first (if user exists with deterministic password)
      const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password: tempPassword,
      });

      if (!signInError && signInData.session) {
        // ✅ User exists and has deterministic password
        console.log("✅ Login bem-sucedido para usuário existente");
        toast({
          title: "Bem-vindo de volta! 👋",
          description: "Entrando na sua conta...",
        });
        navigate("/shop", { replace: true });
        return;
      }

      // STEP 2: If sign in failed, try to create new user
      console.log("Step 2: Tentando criar nova conta...");
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: {
          data: {
            full_name: "",
            phone: fullPhone,
          },
        },
      });

      // If signup fails with "User already exists", redirect to auth
      if (signUpError?.message?.includes("User already registered")) {
        console.log("❌ Usuário existe, redirecionando para /auth");
        toast({
          title: "Conta já existe! 🔐",
          description: "Você já tem uma conta Ekoa registrada. Use /auth para fazer login com WhatsApp + Senha.",
          variant: "default",
        });
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 2000);
        return;
      }

      if (signUpError) {
        console.error("Erro ao criar conta:", signUpError);
        throw signUpError;
      }

      if (signUpData.user) {
        // STEP 3: Sign in the newly created user
        console.log("Step 3: Fazendo login no novo usuário criado...");
        toast({
          title: "Bem-vindo ao Ekoa! 🚴",
          description: "Criando sua conta...",
        });

        const { error: newSignInError } = await supabase.auth.signInWithPassword({
          email: tempEmail,
          password: tempPassword,
        });

        if (newSignInError) {
          console.error("Erro ao fazer login no novo usuário:", newSignInError);
          throw newSignInError;
        }

        toast({
          title: "Conta criada! 🎉",
          description: "Bem-vindo à plataforma Ekoa",
        });
        navigate("/shop", { replace: true });
      }
    } catch (error: any) {
      console.error("WhatsApp login error:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao conectar com WhatsApp",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #12402F 0%, #1E6B4A 100%)" }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20"
        style={{ background: "rgba(255,255,255,0.3)" }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full opacity-20"
        style={{ background: "rgba(255,255,255,0.2)" }}
      />

      {/* Language Selector */}
      <div className="absolute top-4 right-4">
        <LanguageSelector variant="light" />
      </div>

      {/* Content */}
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <EkoaLogo invert withTagline className="h-20 mx-auto" />
        </div>

        {/* Form Card */}
        <div className="bg-white/95 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary font-display mb-2">
              Bem-vindo
            </h2>
            <p className="text-primary/70 text-sm">
              Acesse com seu WhatsApp para começar
            </p>
          </div>

          <form onSubmit={handleWhatsAppLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-primary font-semibold">País / Região</Label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="border-2 border-primary/20 bg-white text-primary focus:border-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flag} {c.country} (+{c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-primary font-semibold">
                Seu número WhatsApp
              </Label>
              <div className="flex items-center gap-2 border-2 border-primary/20 rounded-lg overflow-hidden focus-within:border-primary/50 transition-colors bg-white">
                <span className="px-4 text-primary font-semibold">+{countryCode}</span>
                <Input
                  id="phone"
                  type="tel"
                  value={formatPhoneDisplay(phone, countryCode)}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value).slice(0, getPhoneMaxLength(countryCode)))}
                  maxLength={getPhoneMaxLength(countryCode) + 10}
                  placeholder="Seu número"
                  className="border-0 focus-visible:ring-0 text-primary placeholder:text-primary/40"
                />
              </div>
              <p className="text-xs text-primary/60 mt-2">
                Apenas números - formatação automática
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              {loading ? "Conectando..." : "Entrar na Ekoa"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          {/* Terms and Login Link */}
          <div className="space-y-3 mt-6">
            <p className="text-xs text-primary/60 text-center">
              Ao continuar, você concorda com nossos{" "}
              <span className="text-primary font-semibold cursor-pointer hover:underline">
                Termos de Serviço
              </span>
            </p>
            <p className="text-xs text-primary/60 text-center">
              Já tenho conta{" "}
              <button
                onClick={() => navigate("/auth")}
                className="text-primary font-semibold hover:underline"
              >
                Fazer login
              </button>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-10 grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center text-center text-primary/80">
            <Bike className="w-6 h-6 mb-2" />
            <p className="text-xs font-semibold">Premium</p>
            <p className="text-xs text-primary/70">E-bikes</p>
          </div>
          <div className="flex flex-col items-center text-center text-primary/80">
            <Lock className="w-6 h-6 mb-2" />
            <p className="text-xs font-semibold">Seguro</p>
            <p className="text-xs text-primary/70">Rastreamento</p>
          </div>
          <div className="flex flex-col items-center text-center text-primary/80">
            <Leaf className="w-6 h-6 mb-2" />
            <p className="text-xs font-semibold">Sustentável</p>
            <p className="text-xs text-primary/70">Zero emissões</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
