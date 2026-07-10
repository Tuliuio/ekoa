/**
 * Generates deterministic password for WhatsApp-based users
 * Rule: Password is always ekoa_{full_phone_number}
 * where full_phone_number = country_code + phone_number
 */
export const generateWhatsAppPassword = (fullPhone: string): string => {
  const password = `ekoa_${fullPhone}`;
  return password.substring(0, 32); // Supabase requires max 72 chars, keeping under for safety
};

/**
 * Extracts phone number from WhatsApp email
 * Example: "5548999999999@ekoa.whatsapp" -> "5548999999999"
 */
export const extractPhoneFromEmail = (email: string): string | null => {
  if (!email.includes("@ekoa.whatsapp")) {
    return null;
  }
  return email.split("@")[0];
};

/**
 * Creates email for WhatsApp authentication
 * Example: fullPhone "5548999999999" -> "5548999999999@ekoa.whatsapp"
 */
export const createWhatsAppEmail = (fullPhone: string): string => {
  return `${fullPhone}@ekoa.whatsapp`;
};

/**
 * Validates if email follows WhatsApp authentication pattern
 */
export const isWhatsAppEmail = (email: string): boolean => {
  return email.includes("@ekoa.whatsapp");
};
