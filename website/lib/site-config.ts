// Central place for site-wide constants so they only need to be updated once.
//
// Branding below is static — it rarely changes and feeds page metadata, so
// it stays as plain constants. Operational values (WhatsApp number, pickup
// address, order thresholds) live in the `site_settings` Supabase table
// instead, editable from Admin > Settings — see lib/supabase/settings.ts.
// The DEFAULT_* values here are only a fallback if that row is ever missing
// or unreachable.

export const SITE_NAME = "Wan's Foodies";
export const SITE_DESCRIPTION =
  "Hand-folded frozen curry puffs made fresh in small batches. Order Wan's Foodies curry puffs and get them delivered ready to fry.";
export const SITE_URL = "https://wansfoodies.com"; // TODO(Kio): update once the domain is live

export const WHATSAPP_DEFAULT_MESSAGE =
  "Hi Wan's Foodies! I'd like to ask about your curry puffs.";

export const DEFAULT_WHATSAPP_NUMBER = "601154043689";
export const DEFAULT_PICKUP_ADDRESS =
  "59, Jalan 7A/6, Bandar Tasik Puteri, Rawang 48020, Selangor";
export const DEFAULT_BUSINESS_EMAIL = "";
export const DEFAULT_PREORDER_MINIMUM_BOXES = 3;
export const DEFAULT_LOW_STOCK_THRESHOLD = 2;
export const DEFAULT_MONTHLY_ORDER_LIMIT_BOXES = 50;

export function buildWhatsAppLink(
  message: string = WHATSAPP_DEFAULT_MESSAGE,
  phoneNumber: string = DEFAULT_WHATSAPP_NUMBER,
) {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
