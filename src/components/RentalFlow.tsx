import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { sendBrowserNotification } from "@/hooks/use-reservation-realtime";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  CalendarIcon,
  CheckCircle,
  MapPin,
  Upload,
  Zap,
  MessageCircle,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import ekoaLogo from "@/assets/ekoa-logo.svg";
import LanguageSelector from "@/components/LanguageSelector";
import gt20Img from "@/assets/bikes/gt20.png";
import h9Img from "@/assets/bikes/h9.png";

const BIKE_IMAGES: Record<string, string> = {
  gt20: gt20Img,
  h9: h9Img,
};

const DELIVERY_NEIGHBORHOODS = ["Campeche", "Morro das Pedras", "Rio Tavares", "Lagoa da Conceição"];

interface BikeModel {
  id: string;
  name: string;
  description: string;
  price_per_hour: number;
  model_code: string;
  motor_power: string;
  features: string[];
  top_speed: string;
  battery_range: string;
  capacity: number;
}

interface RentalFlowProps {
  bikes: BikeModel[];
  userId?: string | null;
  onComplete: () => void;
  onCancel: () => void;
}

const STEPS = ["Período", "Escolha a bike", "Endereço", "Dados pessoais", "Documentos", "Contrato", "Confirmação"];

const TERMS_TEXT = `TERMOS E CONDIÇÕES DE LOCAÇÃO DE E-BIKES — EKOA

# TERMO DE LOCAÇÃO — EKOA
## Serviço de Aluguel de Bicicleta Elétrica

Por meio deste termo, você está contratando os serviços da **Ekoa**  
CNPJ: 58.701.133/0001-75

---

# ENTREGA
- Caso a bicicleta não seja devolvida no local acordado, será cobrada taxa de devolução de **R$ 100,00**

# ESTADO DE SAÚDE
- O locatário declara estar em bom estado de saúde e apto a pedalar.

# RASTREAMENTO
- As bicicletas possuem sistema de rastreamento ativo.
- O cliente concorda com o monitoramento durante o período de aluguel.

# SEGURANÇA
- Uso de capacete é **obrigatório**
- Não utilizar sob efeito de álcool ou drogas
- Uso do cadeado é obrigatório em todas as situações

# RESGATE
- Informar imediatamente necessidade de resgate
- Contato emergência: **(48) 99947-1710**

# RESPONSÁVEL LEGAL
- Deve ser maior de 18 anos
- Responsável legal assume responsabilidade por menores

---

# NORMAS DE UTILIZAÇÃO

## Regras de Trânsito
- Calçadas: 6km/h  
- Ciclovias: 25km/h  
- Conforme resolução CONTRAN 996/2023

## Chuva
- Proibido usar em chuva torrencial

## Praia
- Proibido pedalar na areia ou água

## Bateria
- Não expor ao sol
- Não carregar quente

## Freios
- Não aplicar óleo ou graxa

## Riscos
- Cliente assume riscos de acidentes

## Uso Comercial
- Proibido uso para delivery
- Multa: **R$ 5.000,00**

## Guarda da Bicicleta
- Guardar em local seguro

## Mudança de Endereço
- Informar novo endereço

## Bagageiro
- Limite: **5kg**

## Limite de Carga
- Limite total: **140kg**

## Limite de Área
- Apenas Florianópolis

## Rodovias
- Proibido uso em rodovias

## Sublocação
- Proibida

## Danos a Terceiros
- Responsabilidade do locatário

## Alterações
- Proibidas sem autorização

## Limpeza
- Taxa limpeza: **R$150,00**

---

# AVARIAS

| Item | Valor |
|------|------|
Carregador | R$ 350,00
Controladora | R$ 2.000,00
Lanterna traseira | R$ 350,00
Motor | R$ 2.400,00
Chave tranca | R$ 220,00
Farol | R$ 512,00
Sensor motor | R$ 1.000,00
Chave bateria | R$ 175,00
Pedal | R$ 70,00
Pastilha freio | R$ 170,00
Pneu dianteiro | R$ 200,00
Controle alarme | R$ 190,00
Banco | R$ 290,00
Pneu traseiro | R$ 200,00
Pé apoio | R$ 200,00
Retrovisor | R$ 75,00
Bagageiro | R$ 100,00
Capacete | R$ 150,00
Bateria | R$ 2.500,00
Cadeado | R$ 150,00

---

# FURTO OU ROUBO
- Boletim em até 24h
- Coparticipação: **R$ 3.000,00**
- Prazo pagamento: 10 dias

---

# PAGAMENTO
- Débito automático ou boleto
- Autorização irrevogável
- Possível protesto em caso de inadimplência

---

# ATRASO NO PAGAMENTO
- Juros: 1% ao mês
- Multa: 5%
- Correção IGP-M

---

# CANCELAMENTO
- Cancelamento em 24h: paga 1 diária
- Sem reembolso antecipado

---

# REEMBOLSO
- Prazo: até 30 dias

---

# VIGÊNCIA
- Conforme plano contratado
- Renovação automática mensal

---

# PRIVACIDADE
- Coleta de dados
- Uso de geolocalização
- Autorização de uso de imagem
`;

const WHATSAPP_NUMBER = "554831978987";

const SupportButton = () => (
  <div className="mt-6 text-center">
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Oi! Preciso de ajuda com minha reserva na Ekoa 🛵")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
    >
      <MessageCircle className="w-4 h-4" />
      Deu algum problema? Chama aqui que a gente resolve 👋
    </a>
  </div>
);

const RentalFlow = ({ bikes, userId: initialUserId, onComplete, onCancel }: RentalFlowProps) => {
  const [step, setStep] = useState(0);
  const [selectedBike, setSelectedBike] = useState<BikeModel | null>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [isTourist, setIsTourist] = useState(false);
  const [accommodationAddress, setAccommodationAddress] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [files, setFiles] = useState<{ type: string; file: File }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [hasCoupon, setHasCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [isForeigner, setIsForeigner] = useState(false);
  const [passportNumber, setPassportNumber] = useState("");
  const [checkinTime, setCheckinTime] = useState<"8" | "14" | "custom">("8");
  const [customCheckinTime, setCustomCheckinTime] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Auth state — phone-only gate at the start
  const [currentUserId, setCurrentUserId] = useState<string | null>(initialUserId || null);
  const [authReady, setAuthReady] = useState(false);
  const [phoneEntry, setPhoneEntry] = useState("");
  const [phoneAuthLoading, setPhoneAuthLoading] = useState(false);

  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setCurrentUserId(session.user.id);
      setAuthReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setCurrentUserId(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Prefill phone field from gate entry once authenticated
  useEffect(() => {
    if (currentUserId && phoneEntry && !phone) {
      setPhone(formatPhone(phoneEntry));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);


  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 10) {
      return digits
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
    }
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
  };

  // Same-day rental rules: if start date is today, only allow 14h check-in
  const isSameDayStart = (() => {
    if (!startDate) return false;
    const today = new Date();
    return (
      startDate.getFullYear() === today.getFullYear() &&
      startDate.getMonth() === today.getMonth() &&
      startDate.getDate() === today.getDate()
    );
  })();

  // Auto-force 14h when same-day and 8h is selected
  useEffect(() => {
    if (isSameDayStart && checkinTime === "8") {
      setCheckinTime("14");
    }
  }, [isSameDayStart, checkinTime]);

  const canNext = () => {
    switch (step) {
      case 0:
        return !!startDate && !!endDate;
      case 1:
        return !!selectedBike;
      case 2: {
        const baseValid = address.trim().length > 5 && neighborhood.length > 0;
        if (isTourist) {
          return baseValid && accommodationAddress.trim().length > 5 && pickupLocation.trim().length > 3;
        }
        return baseValid;
      }
      case 3:
        return (
          fullName.trim().length > 3 &&
          phone.replace(/\D/g, "").length >= 10 &&
          (isForeigner ? passportNumber.trim().length > 3 : cpf.replace(/\D/g, "").length === 11) &&
          password.length >= 6 &&
          confirmPassword.length >= 6 &&
          password === confirmPassword
        );
      case 4:
        return files.length >= 1;
      case 5:
        return acceptedTerms;
      default:
        return true;
    }
  };

  const handleFileChange = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 10MB por arquivo.", variant: "destructive" });
      return;
    }
    setFiles((prev) => [...prev.filter((f) => f.type !== type), { type, file }]);
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    return Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const getDailyRate = (days: number): number => {
    if (days <= 0) return 0;
    if (days === 1) return 159;
    if (days === 2) return 139;
    if (days === 3) return 119;
    if (days === 4) return 99;
    if (days === 5) return 89;
    if (days === 6) return 79;
    return 69;
  };

  const calculateSubtotal = () => {
    const days = calculateDays();
    if (days <= 0) return 0;
    return parseFloat((days * getDailyRate(days)).toFixed(2));
  };

  const couponDiscount = hasCoupon && couponCode.trim() ? 0.05 : 0;

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    if (couponDiscount > 0) {
      return parseFloat((subtotal * (1 - couponDiscount)).toFixed(2));
    }
    return subtotal;
  };

  const ensureProfile = async (userId: string) => {
    const cleanPhone = phone.replace(/\D/g, "") || phoneEntry.replace(/\D/g, "");
    // Upsert profile with latest data (name + phone)
    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        full_name: fullName.trim() || "",
        ...(cleanPhone ? { phone: cleanPhone } : {}),
      },
      { onConflict: "id" },
    );
    if (error && !error.message.includes("duplicate")) {
      throw new Error("Não foi possível salvar o perfil. Tente novamente.");
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phoneEntry.replace(/\D/g, "");
    if (cleaned.length < 10) {
      toast({ title: "WhatsApp inválido", description: "Informe DDD + número.", variant: "destructive" });
      return;
    }
    setPhoneAuthLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("phone-signin", {
        body: { phone: cleaned },
      });
      if (error) throw error;
      if (!data?.email || !data?.password) throw new Error("Resposta inválida do servidor.");
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (signInError) throw signInError;
      setCurrentUserId(signInData.user.id);
      setPhone(formatPhone(cleaned));
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Não foi possível entrar.", variant: "destructive" });
    } finally {
      setPhoneAuthLoading(false);
    }
  };


  const handleSubmit = async () => {
    if (!selectedBike || !startDate || !endDate) return;

    if (!currentUserId) {
      toast({ title: "Sessão expirada", description: "Entre novamente com seu WhatsApp.", variant: "destructive" });
      return;
    }

    // Validate password
    if (!password || !confirmPassword) {
      toast({ title: "Senha obrigatória", description: "Crie uma senha para proteger sua conta.", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Senha fraca", description: "A senha deve ter no mínimo 6 caracteres.", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Senhas não coincidem", description: "Verifique e tente novamente.", variant: "destructive" });
      return;
    }

    setUploading(true);

    try {
      // Ensure profile exists before creating reservation
      await ensureProfile(currentUserId);

      const deliveryAddr = isTourist ? accommodationAddress : address;
      const notes = [
        `Nome: ${fullName.trim()}`,
        `WhatsApp: ${phone.trim()}`,
        isForeigner ? `Passaporte: ${passportNumber.trim()}` : `CPF: ${cpf.trim()}`,
        isTourist
          ? `Turista — Hospedagem: ${accommodationAddress.trim()} | Retirada/Devolução: ${pickupLocation.trim()}`
          : null,
        hasCoupon && couponCode.trim() ? `Cupom: ${couponCode.trim()}` : null,
        checkinTime === "custom"
          ? `Horário solicitado: ${customCheckinTime.trim() || "não informado"} (pendente aprovação)`
          : `Check-in: ${checkinTime}h`,
      ]
        .filter(Boolean)
        .join(" | ");

      // Apply selected check-in hour to start date (custom uses 8h provisoriamente)
      const checkinHour = checkinTime === "custom" ? 8 : Number(checkinTime);
      const startWithTime = new Date(startDate);
      startWithTime.setHours(checkinHour, 0, 0, 0);
      const endWithTime = new Date(endDate);
      endWithTime.setHours(checkinHour, 0, 0, 0);

      const referralCode = (typeof window !== "undefined" ? localStorage.getItem("ekoa_referral_code") : null)?.toUpperCase() || null;

      const { data: reservation, error: resError } = await supabase
        .from("reservations")
        .insert({
          user_id: currentUserId,
          space_id: selectedBike.id,
          start_time: startWithTime.toISOString(),
          end_time: endWithTime.toISOString(),
          status: "pending_docs",
          total_price: calculateTotal(),
          delivery_address: deliveryAddr,
          delivery_neighborhood: neighborhood,
          delivery_city: "Florianópolis",
          delivery_notes: deliveryNotes,
          notes,
          document_status: "pending",
          payment_status: "pending",
          referral_code: referralCode,
        } as any)
        .select()
        .single();

      if (resError) throw resError;

      for (const { type, file } of files) {
        const ext = file.name.split(".").pop();
        const path = `${currentUserId}/${reservation.id}/${type}.${ext}`;

        const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);

        if (uploadError) throw uploadError;

        await supabase.from("user_documents").insert({
          user_id: currentUserId,
          reservation_id: reservation.id,
          document_type: type,
          file_path: path,
          file_name: file.name,
          status: "pending",
        });
      }

      await supabase
        .from("reservations")
        .update({ status: "under_review", document_status: "pending" })
        .eq("id", reservation.id);

      // Update user password for security
      try {
        await supabase.auth.updateUser({ password });
      } catch (error) {
        console.error("Erro ao atualizar senha:", error);
        // Don't fail the reservation if password update fails
      }

      toast({
        title: "Reserva enviada para análise! 📋",
        description:
          "Seus documentos estão sendo analisados. Você receberá uma notificação quando for aprovado e o link de pagamento ficará disponível.",
      });

      // Send browser notification
      sendBrowserNotification(
        "Reserva Ekoa Enviada! 📋",
        "Seus documentos estão sendo analisados. Você será notificado quando for aprovado.",
        reservation.id
      );

      onComplete();
    } catch (error: any) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  // Phone-only gate at the very start of the rental flow
  if (authReady && !currentUserId) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden flex flex-col">
        <header
          className="border-b border-border"
          style={{ background: "linear-gradient(135deg, #0C2E22 0%, #12402F 100%)" }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-[56px] sm:h-[72px] flex items-center justify-between gap-2">
            <img src={ekoaLogo} alt="Ekoa" className="h-6 sm:h-8 brightness-0 invert" />
            <div className="flex items-center gap-2">
              <LanguageSelector variant="dark" />
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md hover:translate-y-0">
            <CardContent className="p-6 sm:p-8">
              <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight font-display text-center mb-2">
                Bora alugar! 🛵
              </h1>
              <p className="text-muted-foreground text-center mb-6 text-sm">
                Pra começar, é só o seu WhatsApp. O resto a gente pede no caminho.
              </p>
              <form onSubmit={handlePhoneAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input
                    value={phoneEntry}
                    onChange={(e) => setPhoneEntry(formatPhone(e.target.value))}
                    placeholder="(48) 99999-9999"
                    inputMode="tel"
                    maxLength={15}
                    autoFocus
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Vamos usar pra falar contigo sobre a entrega e o pagamento.
                  </p>
                </div>
                <Button
                  type="submit"
                  variant="accent"
                  className="w-full"
                  disabled={phoneAuthLoading}
                >
                  {phoneAuthLoading ? "Entrando..." : "Continuar"}
                </Button>
              </form>
              <SupportButton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header
        className="border-b border-border"
        style={{ background: "linear-gradient(135deg, #0C2E22 0%, #12402F 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-[56px] sm:h-[72px] flex items-center justify-between gap-2">
          <img src={ekoaLogo} alt="Ekoa" className="h-6 sm:h-8 brightness-0 invert" />
          <div className="flex items-center gap-2">
            <LanguageSelector variant="dark" />
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">
        {/* Progress */}
        <div className="mb-8">
          {/* Dots row — fits any width without scroll */}
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 font-display shrink-0",
                    i < step
                      ? "bg-accent text-accent-foreground"
                      : i === step
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-px flex-1 mx-1 sm:mx-2 transition-colors",
                      i < step ? "bg-accent" : "bg-border",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          {/* Current step label */}
          <p className="mt-3 text-center text-sm font-medium text-foreground font-display">
            <span className="text-muted-foreground">Passo {step + 1} de {STEPS.length} —</span>{" "}
            {STEPS[step]}
          </p>
        </div>

        {/* Step 1: Choose Bike */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-2 font-display text-center">
              Escolha sua e-bike
            </h2>
            <p className="text-muted-foreground mb-8 text-center">
              Selecione o modelo que combina com sua aventura.
            </p>
            <div
              className={cn(
                "grid gap-6 mx-auto",
                bikes.length === 1
                  ? "max-w-md grid-cols-1"
                  : bikes.length === 2
                    ? "max-w-4xl grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl",
              )}
            >
              {bikes.map((bike) => (
                <div
                  key={bike.id}
                  className={cn(
                    "cursor-pointer transition-all flex flex-col rounded-2xl border bg-card p-6 shadow-sm group",
                    "hover:shadow-md hover:-translate-y-0.5",
                    selectedBike?.id === bike.id
                      ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                      : "border-border hover:border-primary/40",
                  )}
                  onClick={() => {
                    setSelectedBike(bike);
                    // Auto-advance to next step shortly after selection
                    setTimeout(() => setStep((s) => (s === 1 ? 2 : s)), 280);
                  }}
                >
                  <div className="pb-3">
                    <div className="w-full h-56 md:h-64 flex items-center justify-center mb-3">
                      {BIKE_IMAGES[bike.model_code?.toLowerCase()] ? (
                        <img
                          src={BIKE_IMAGES[bike.model_code?.toLowerCase()]}
                          alt={bike.name}
                          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <Bike className="w-20 h-20 text-muted-foreground/30" />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold uppercase text-center font-display">{bike.name}</h3>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground mb-4 text-center">{bike.description}</p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {bike.features?.map((f) => (
                        <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Zap className="w-3 h-3 text-accent-foreground" />
                          {f}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center pt-3 mt-auto border-t border-border">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="w-3 h-3 text-accent-foreground" />
                        50km por carga
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <SupportButton />
          </div>
        )}

        {/* Step 0: Dates */}
        {step === 0 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-2 font-display text-center">Escolha o período</h2>
            <p className="text-muted-foreground mb-6 text-center">Selecione as datas de início e fim do aluguel.</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2 block">Data de início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd 'de' MMMM, yyyy", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="mb-2 block">Data de devolução</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd 'de' MMMM, yyyy", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => {
                        const minDate = startDate ? new Date(startDate) : new Date();
                        minDate.setHours(0, 0, 0, 0);
                        return date < minDate;
                      }}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Check-in time */}
            <div className="mt-6">
              <Label className="mb-2 block">Horário de check-in (entrega)</Label>
              <div className="flex gap-3">
                {[
                  { value: "8" as const, label: "08h" },
                  { value: "14" as const, label: "14h" },
                  { value: "custom" as const, label: "Outro" },
                ].map((opt) => {
                  const disabled = isSameDayStart && opt.value === "8";
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={disabled}
                      onClick={() => !disabled && setCheckinTime(opt.value)}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl border-2 text-center font-bold font-display transition-all",
                        disabled
                          ? "border-border text-muted-foreground/40 cursor-not-allowed bg-muted/30"
                          : checkinTime === opt.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {checkinTime === "custom" && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="ex: 10h, 11h30…"
                    value={customCheckinTime}
                    onChange={(e) => setCustomCheckinTime(e.target.value)}
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Sujeito à confirmação de disponibilidade pela equipe Ekoa.
                  </p>
                </div>
              )}
              {isSameDayStart && (
                <p className="text-xs text-muted-foreground mt-2">
                  Para locações no mesmo dia, o check-in disponível é apenas às 14h.
                </p>
              )}
            </div>
            {startDate &&
              endDate &&
              (() => {
                const days = calculateDays();
                const dailyRate = getDailyRate(days);
                const total = calculateTotal();
                const fullPrice = days * 159;
                const savings = fullPrice - calculateSubtotal();
                return (
                  <Card
                    className="mt-6 border-accent/30 hover:translate-y-0"
                    style={{ background: "linear-gradient(135deg, rgba(196,255,121,0.15), rgba(141,255,234,0.15))" }}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold font-display">
                            {days} dia{days > 1 ? "s" : ""}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(startDate, "dd/MM")} → {format(endDate, "dd/MM")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary font-display">R$ {total.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">R$ {dailyRate.toFixed(2)}/dia</p>
                        </div>
                      </div>
                      {savings > 0 && (
                        <p className="text-sm font-medium text-accent-foreground">
                          🎉 Você economiza R$ {savings.toFixed(2)} com {days} dias!
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}
            <SupportButton />
          </div>
        )}

        {/* Step 2: Address */}
        {step === 2 && (
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-2 font-display text-center">Endereço de entrega</h2>
            <p className="text-muted-foreground mb-6 text-center">Onde devemos entregar sua e-bike?</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Endereço completo</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, número, complemento"
                />
              </div>
              <div className="space-y-2">
                <Label>Bairro</Label>
                <Select value={neighborhood} onValueChange={setNeighborhood}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o bairro" />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERY_NEIGHBORHOODS.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Observações (opcional)</Label>
                <Input
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Ponto de referência, horário preferido..."
                />
              </div>

              {/* Tourist toggle */}
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border">
                <Switch id="isTourist" checked={isTourist} onCheckedChange={setIsTourist} />
                <Label htmlFor="isTourist" className="text-sm font-medium cursor-pointer">
                  Sou turista
                </Label>
              </div>

              {isTourist && (
                <div className="space-y-4 pl-2 border-l-2 border-primary/20">
                  <div className="space-y-2">
                    <Label>Endereço da hospedagem</Label>
                    <Input
                      value={accommodationAddress}
                      onChange={(e) => setAccommodationAddress(e.target.value)}
                      placeholder="Ex: Pousada Floripa, Rua das Flores 123, Campeche"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Local de retirada / devolução</Label>
                    <Input
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="Ex: Na recepção da pousada ou portaria do condomínio"
                    />
                  </div>
                </div>
              )}

              <div
                className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{ background: "linear-gradient(135deg, rgba(196,255,121,0.15), rgba(141,255,234,0.15))" }}
              >
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground">
                  Entregamos nos bairros Campeche, Morro das Pedras, Rio Tavares e Lagoa da Conceição.
                </span>
              </div>
            </div>
            <SupportButton />
          </div>
        )}

        {/* Step 3: Personal Data */}
        {step === 3 && (
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-2 font-display text-center">Dados pessoais</h2>
            <p className="text-muted-foreground mb-6 text-center">Precisamos de algumas informações para o contrato de locação.</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome completo</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome completo" />
              </div>

              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(48) 99999-9999"
                  inputMode="tel"
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground">
                  Vamos usar pra alinhar a entrega e mandar o link de pagamento.
                </p>
              </div>

              {/* Password Section */}
              <div className="p-4 rounded-lg" style={{ background: "rgba(196,255,121,0.1)" }}>
                <p className="text-sm font-semibold text-primary mb-3">🔐 Crie sua senha de acesso</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Para garantir segurança em acessos futuros, crie uma senha forte. Você poderá usar ela junto com seu WhatsApp para entrar na plataforma.
                </p>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Crie uma senha forte"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mínimo 6 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirme sua senha</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Digite sua senha novamente"
                      minLength={6}
                    />
                  </div>

                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive">❌ As senhas não coincidem</p>
                  )}
                  {password && confirmPassword && password === confirmPassword && (
                    <p className="text-xs text-accent-foreground">✅ Senhas coincidem</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl border border-border">
                <input
                  type="checkbox"
                  id="isForeigner"
                  checked={isForeigner}
                  onChange={(e) => {
                    setIsForeigner(e.target.checked);
                    if (e.target.checked) setCpf("");
                    else setPassportNumber("");
                  }}
                  className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                />
                <Label htmlFor="isForeigner" className="text-sm font-medium cursor-pointer">
                  Sou estrangeiro
                </Label>
              </div>

              {isForeigner ? (
                <div className="space-y-2">
                  <Label>Número do passaporte</Label>
                  <Input
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    placeholder="Ex: AB1234567"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input
                    value={cpf}
                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    inputMode="numeric"
                  />
                </div>
              )}
            </div>
            <SupportButton />
          </div>
        )}

        {/* Step 4: Documents (no selfie) */}
        {step === 4 && (
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-2 font-display text-center">Envie seus documentos</h2>
            <p className="text-muted-foreground mb-6 text-center">
              Para sua segurança, precisamos validar sua identidade antes de liberar a e-bike.
            </p>
            <div className="space-y-4">
              {[
                { type: "rg_cnh", label: "RG ou CNH (frente e verso)", desc: "Documento com foto legível" },
                {
                  type: "comprovante",
                  label: "Comprovante de residência ou hospedagem",
                  desc: "Conta de luz, água, internet ou voucher de hospedagem",
                },
              ].map(({ type, label, desc }) => {
                const uploaded = files.find((f) => f.type === type);
                return (
                  <label
                    key={type}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200",
                      uploaded ? "border-primary bg-primary/5" : "border-border hover:border-primary/30",
                    )}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        uploaded ? "bg-primary/10" : "bg-muted",
                      )}
                    >
                      {uploaded ? (
                        <CheckCircle className="w-6 h-6 text-primary" />
                      ) : (
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground">{uploaded ? uploaded.file.name : desc}</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileChange(type, e)}
                    />
                  </label>
                );
              })}
              <p className="text-xs text-muted-foreground">Aceitos: JPG, PNG, PDF. Máximo 10MB por arquivo.</p>
            </div>
            <SupportButton />
          </div>
        )}

        {/* Step 5: Contract / Terms */}
        {step === 5 && (
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-2 font-display text-center">Termos e condições</h2>
            <p className="text-muted-foreground mb-6 text-center">Leia atentamente os termos do contrato de locação.</p>
            <div className="space-y-4">
              <Card className="hover:translate-y-0">
                <CardContent className="p-0">
                  <ScrollArea className="h-[300px] p-4">
                    <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans leading-relaxed">
                      {TERMS_TEXT}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
              <div className="flex items-start gap-3 p-4 rounded-xl border border-border">
                <Checkbox
                  id="acceptTerms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="acceptTerms"
                  className="text-sm font-medium cursor-pointer leading-relaxed normal-case tracking-normal"
                >
                  Li e aceito os termos do contrato de locação
                </Label>
              </div>
            </div>
            <SupportButton />
          </div>
        )}

        {/* Step 6: Confirmation */}
        {step === 6 && selectedBike && startDate && endDate && (
          <div>
              <div className="max-w-lg mx-auto">
                <h2 className="text-2xl font-bold uppercase tracking-tight mb-2 font-display text-center">Bora confirmar! 🛵</h2>
                <p className="text-muted-foreground mb-6 text-center">Dá uma olhada se tá tudo certo antes de enviar.</p>
                <Card className="hover:translate-y-0">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-4 pb-4 border-b border-border">
                      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center overflow-hidden">
                        {BIKE_IMAGES[selectedBike.model_code?.toLowerCase()] ? (
                          <img
                            src={BIKE_IMAGES[selectedBike.model_code?.toLowerCase()]}
                            alt={selectedBike.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Bike className="w-8 h-8 text-muted-foreground/40" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold uppercase font-display">{selectedBike.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedBike.motor_power} • {selectedBike.top_speed}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Período</span>
                        <span className="font-medium">
                          {format(startDate, "dd/MM")} → {format(endDate, "dd/MM")} ({calculateDays()} dias)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entrega</span>
                        <span className="font-medium text-right max-w-[200px]">
                          {address}, {neighborhood}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nome</span>
                        <span className="font-medium text-right max-w-[200px] truncate">{fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isForeigner ? "Passaporte" : "CPF"}</span>
                        <span className="font-medium">{isForeigner ? passportNumber : cpf}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">WhatsApp</span>
                        <span className="font-medium">{phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Documentos</span>
                        <span className="font-medium">
                          {files.length} enviado{files.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {isTourist && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Hospedagem</span>
                            <span className="font-medium text-right max-w-[200px] truncate">
                              {accommodationAddress}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Retirada/Devolução</span>
                            <span className="font-medium text-right max-w-[200px] truncate">{pickupLocation}</span>
                          </div>
                        </>
                      )}
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between items-center pt-4 border-t border-border">
                        <span className="text-muted-foreground font-medium">Subtotal</span>
                        <span className="text-lg text-muted-foreground line-through font-display">
                          R$ {calculateSubtotal().toFixed(2)}
                        </span>
                      </div>
                    )}
                    {couponDiscount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-accent-foreground font-medium text-sm">Desconto cupom (5%)</span>
                        <span className="text-sm font-bold text-accent-foreground font-display">
                          - R$ {(calculateSubtotal() * couponDiscount).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div
                      className={cn(
                        "flex justify-between items-center",
                        couponDiscount === 0 && "pt-4 border-t border-border",
                      )}
                    >
                      <span className="text-muted-foreground font-medium">Total estimado</span>
                      <span className="text-2xl font-bold text-primary font-display">
                        R$ {calculateTotal().toFixed(2)}
                      </span>
                    </div>

                    {/* Coupon */}
                    <div className="pt-4 border-t border-border space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="hasCoupon"
                          checked={hasCoupon}
                          onChange={(e) => {
                            setHasCoupon(e.target.checked);
                            if (!e.target.checked) setCouponCode("");
                          }}
                          className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                        />
                        <Label htmlFor="hasCoupon" className="text-sm font-medium cursor-pointer">
                          Tenho um cupom de desconto
                        </Label>
                      </div>
                      {hasCoupon && (
                        <Input
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Digite o código do cupom"
                          className="uppercase tracking-wider font-bold"
                          maxLength={30}
                        />
                      )}
                      {hasCoupon && couponCode.trim() && (
                        <p className="text-xs text-accent-foreground font-medium">
                          ✅ Cupom aplicado! 5% de desconto no valor total.
                        </p>
                      )}
                    </div>

                    {/* Analysis Flow Info */}
                    <div className="space-y-3 pt-4 border-t border-border">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "rgba(196,255,121,0.1)" }}>
                          <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-semibold text-primary">Enviado para Análise</p>
                            <p className="text-primary/70 text-xs">Seus documentos estão sendo verificados</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <CheckCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-semibold text-muted-foreground">Cadastro Aprovado</p>
                            <p className="text-muted-foreground/70 text-xs">Você receberá uma notificação quando for aprovado</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <ShoppingBag className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-semibold text-muted-foreground">Link de Pagamento</p>
                            <p className="text-muted-foreground/70 text-xs">Após aprovado, o link fica disponível no seu dashboard</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <SupportButton />
              </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => (step > 0 ? setStep(step - 1) : onCancel())}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step > 0 ? "Voltar" : "Cancelar"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext()} variant="accent">
              Próximo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={uploading} variant="accent">
              {uploading ? "Enviando..." : "Confirmar reserva"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalFlow;
