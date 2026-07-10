import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LanguageSelectorProps {
  variant?: "light" | "dark";
}

const LanguageSelector = ({ variant = "dark" }: LanguageSelectorProps) => {
  const { i18n } = useTranslation();

  const current = (i18n.resolvedLanguage || i18n.language || "pt").slice(0, 2);

  const triggerClass =
    variant === "dark"
      ? "h-9 w-auto gap-1.5 rounded-full border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 focus:ring-0 focus:ring-offset-0 px-3 text-xs font-bold uppercase tracking-wider"
      : "h-9 w-auto gap-1.5 rounded-full border-border bg-background hover:bg-muted focus:ring-0 focus:ring-offset-0 px-3 text-xs font-bold uppercase tracking-wider";

  const labelMap: Record<string, string> = { pt: "PT", en: "EN", es: "ES" };

  return (
    <Select value={current} onValueChange={(v) => i18n.changeLanguage(v)}>
      <SelectTrigger className={triggerClass} aria-label="Language">
        <Globe className="w-3.5 h-3.5 shrink-0" />
        <SelectValue>{labelMap[current] || "PT"}</SelectValue>
      </SelectTrigger>
      <SelectContent align="end" className="min-w-[140px]">
        <SelectItem value="pt">🇧🇷 Português</SelectItem>
        <SelectItem value="en">🇺🇸 English</SelectItem>
        <SelectItem value="es">🇪🇸 Español</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
