// Central place for site-wide constants so they only need to be updated once.
// TODO(Kio): swap in Wan's real WhatsApp number (with country code, no + or spaces).
export const WHATSAPP_NUMBER = "601154043689";

export const WHATSAPP_DEFAULT_MESSAGE =
  "Hi Wan's Foodies! I'd like to ask about your curry puffs 😊";

export function buildWhatsAppLink(message: string = WHATSAPP_DEFAULT_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const SITE_NAME = "Wan's Foodies";
export const SITE_DESCRIPTION =
  "Hand-folded frozen curry puffs made fresh in small batches. Order Wan's Foodies curry puffs and get them delivered ready to fry.";
export const SITE_URL = "https://wansfoodies.com"; // TODO(Kio): update once the domain is live
