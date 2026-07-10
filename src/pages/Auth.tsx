import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/use-auth-session";
import { Eye, EyeOff } from "lucide-react";
import ekoaLogo from "@/assets/ekoa-logo.svg";
import LanguageSelector from "@/components/LanguageSelector";
import { getUserRoute } from "@/lib/auth";

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

const Auth = () => {
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("55");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetPhone, setResetPhone] = useState("");
  const [resetCountryCode, setResetCountryCode] = useState("55");
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, authReady } = useAuthSession();
  const { t } = useTranslation();

  useEffect(() => {
    if (!authReady || !user || loading) return;

    let isMounted = true;

    getUserRoute(user.id).then((route) => {
      if (isMounted) {
        navigate(route, { replace: true });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [authReady, loading, navigate, user]);

  const formatPhoneNumber = (value: string) => {
    return value.replace(/\D/g, "");
  };

  const generatePassword = (fullPhone: string) => {
    const base = `ekoa_${fullPhone}`;
    return base.substring(0, 32);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim()) {
      toast({ title: "Erro", description: "Digite seu número de WhatsApp", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Erro", description: "Senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phone);
      const fullPhone = countryCode + formattedPhone;
      const tempEmail = `${fullPhone}@ekoa.whatsapp`;

      const { data, error } = await supabase.auth.signInWithPassword({ email: tempEmail, password });
      if (error) throw error;

      const signedInUser = data.user ?? data.session?.user;
      if (!signedInUser) {
        throw new Error("Login realizado, mas a sessão não foi carregada. Tente novamente.");
      }

      const route = await getUserRoute(signedInUser.id);
      setLoading(false);
      toast({ title: "Bem-vindo! 👋", description: "Entrando na sua conta..." });
      navigate(route, { replace: true });
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: "WhatsApp ou senha incorretos. Verifique e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetPhone.trim()) {
      toast({ title: "Erro", description: "Digite seu número de WhatsApp", variant: "destructive" });
      return;
    }

    setResetLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(resetPhone);
      const fullPhone = resetCountryCode + formattedPhone;
      const tempEmail = `${fullPhone}@ekoa.whatsapp`;
      const tempPassword = generatePassword(fullPhone);

      // Try to send password reset email via Supabase
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(tempEmail, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (resetError) {
        // If email reset fails, offer alternative
        if (resetError.message?.includes("not found")) {
          throw new Error("WhatsApp não encontrado no sistema.");
        }

        // If SMTP not configured, show helpful message with WhatsApp link
        const whatsappLink = "https://wa.me/4831978987?text=Olá!%20Gostaria%20de%20resetar%20minha%20senha%20na%20plataforma%20Ekoa.";

        toast({
          title: "Reset de senha",
          description: "Para resetar sua senha, clique no link abaixo para contatar suporte.",
          action: {
            label: "Contatar via WhatsApp",
            onClick: () => window.open(whatsappLink, "_blank"),
          },
          variant: "default"
        });

        setShowReset(false);
        setResetPhone("");
        setResetCountryCode("55");
        return;
      }

      toast({
        title: "Email de reset enviado! 📧",
        description: "Verifique seu email para resetar a senha.",
      });

      setShowReset(false);
      setResetPhone("");
      setResetCountryCode("55");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Erro ao resetar",
        description: error.message || "Não foi possível processar seu pedido de reset.",
        variant: "destructive"
      });
    } finally {
      setResetLoading(false);
    }
  };

  if (showReset) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: 'hsl(98 79% 57%)' }}>
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12" style={{ background: 'linear-gradient(135deg, #7CE83C 0%, #B6F58F 100%)' }}>
          <div>
            <img src={ekoaLogo} alt="Ekoa" className="h-10" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4 font-display">
              {t("auth.tagline")}
            </p>
            <h2 className="text-5xl xl:text-6xl font-bold text-primary leading-[1.05] tracking-tight uppercase font-display">
              {t("auth.slogan")}
            </h2>
            <p className="text-primary/80 mt-6 text-lg leading-relaxed max-w-md">
              {t("auth.brandPitch")}
            </p>
          </div>
          <div className="flex gap-8 text-primary/60 text-xs uppercase tracking-wider font-display font-bold">
            <span>{t("auth.safe")}</span>
            <span>{t("auth.noLimits")}</span>
            <span>{t("auth.zeroEmission")}</span>
          </div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
          <div className="absolute top-4 right-4">
            <LanguageSelector variant="light" />
          </div>
          <div className="w-full max-w-sm animate-fade-in">
            <div className="lg:hidden text-center mb-10">
              <img src={ekoaLogo} alt="Ekoa" className="h-8 mx-auto" />
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight font-display text-primary">
                Recuperar Senha 🔑
              </h2>
              <p className="text-primary/70 mt-1 text-sm">
                Digite seu WhatsApp para resetar a senha
              </p>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-primary/80 font-semibold">País / Região</Label>
                <Select value={resetCountryCode} onValueChange={setResetCountryCode}>
                  <SelectTrigger className="border-2 border-primary/20 bg-white/80 text-primary focus:border-primary/50">
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
                <Label htmlFor="resetPhone" className="text-primary/80 font-semibold">
                  Seu número WhatsApp
                </Label>
                <div className="flex items-center gap-2 border-2 border-primary/20 rounded-lg overflow-hidden focus-within:border-primary/50 transition-colors bg-white/80">
                  <span className="px-4 text-primary font-semibold">+{resetCountryCode}</span>
                  <Input
                    id="resetPhone"
                    type="tel"
                    value={resetPhone}
                    onChange={(e) => setResetPhone(e.target.value)}
                    placeholder="Seu número"
                    required
                    className="border-0 focus-visible:ring-0 text-primary placeholder:text-primary/40 bg-transparent"
                  />
                </div>
                <p className="text-xs text-primary/60 mt-2">
                  Digite apenas os números (sem espaços ou hífens)
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
                disabled={resetLoading}
              >
                {resetLoading ? "Resetando..." : "Resetar Senha"}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-primary/70">
              Lembrou a senha?{" "}
              <button
                onClick={() => setShowReset(false)}
                className="text-primary font-bold hover:underline font-display"
              >
                Voltar ao login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: 'hsl(98 79% 57%)' }}>
      {/* Left - Brand panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 bg-white">
        <div>
          <img src={ekoaLogo} alt="Ekoa" className="h-10" />
        </div>
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-600 mb-4 font-display">
            {t("auth.tagline")}
          </p>
          <h2 className="text-5xl xl:text-6xl font-bold text-gray-900 leading-[1.05] tracking-tight uppercase font-display">
            {t("auth.slogan")}
          </h2>
          <p className="text-gray-700 mt-6 text-lg leading-relaxed max-w-md">
            {t("auth.brandPitch")}
          </p>
        </div>
        <div className="flex gap-8 text-gray-500 text-xs uppercase tracking-wider font-display font-bold">
          <span>{t("auth.safe")}</span>
          <span>{t("auth.noLimits")}</span>
          <span>{t("auth.zeroEmission")}</span>
        </div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full" style={{ background: 'rgba(196, 255, 121, 0.05)' }} />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full" style={{ background: 'rgba(196, 255, 121, 0.03)' }} />
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute top-4 right-4">
          <LanguageSelector variant="light" />
        </div>
        <div className="w-full max-w-sm animate-fade-in">
          <div className="lg:hidden text-center mb-10">
            <img src={ekoaLogo} alt="Ekoa" className="h-8 mx-auto" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight font-display text-primary">
              {t("auth.welcomeBack")}
            </h2>
            <p className="text-primary/70 mt-1 text-sm">
              {t("auth.loginSubtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-primary/80 font-semibold">País / Região</Label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="border-2 border-primary/20 bg-white/80 text-primary focus:border-primary/50">
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
              <Label htmlFor="phone" className="text-primary/80 font-semibold">
                Seu número WhatsApp
              </Label>
              <div className="flex items-center gap-2 border-2 border-primary/20 rounded-lg overflow-hidden focus-within:border-primary/50 transition-colors bg-white/80">
                <span className="px-4 text-primary font-semibold">+{countryCode}</span>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Seu número"
                  required
                  className="border-0 focus-visible:ring-0 text-primary placeholder:text-primary/40 bg-transparent"
                />
              </div>
              <p className="text-xs text-primary/60 mt-2">
                Digite apenas os números (sem espaços ou hífens)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-primary/80 font-semibold">{t("common.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="border-2 border-primary/20 bg-white/80 text-primary placeholder:text-primary/40 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/60 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
              disabled={loading}
            >
              {loading ? t("common.loading") : t("common.login")}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <div className="text-sm text-primary/70">
              <button
                onClick={() => setShowReset(true)}
                className="text-primary font-semibold hover:underline"
              >
                Esqueci minha senha
              </button>
            </div>
            <div className="text-sm text-primary/70">
              Não tem conta ainda?{" "}
              <button
                onClick={() => navigate("/")}
                className="text-primary font-bold hover:underline font-display"
              >
                Alugar uma bike
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
