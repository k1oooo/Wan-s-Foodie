import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types";
import {
  DEFAULT_BUSINESS_EMAIL,
  DEFAULT_LOW_STOCK_THRESHOLD,
  DEFAULT_MONTHLY_ORDER_LIMIT_BOXES,
  DEFAULT_PICKUP_ADDRESS,
  DEFAULT_PREORDER_MINIMUM_BOXES,
  DEFAULT_WHATSAPP_NUMBER,
} from "@/lib/site-config";

const FALLBACK_SETTINGS: SiteSettings = {
  id: 1,
  business_email: DEFAULT_BUSINESS_EMAIL,
  contact_phone: DEFAULT_WHATSAPP_NUMBER,
  pickup_address: DEFAULT_PICKUP_ADDRESS,
  preorder_minimum_boxes: DEFAULT_PREORDER_MINIMUM_BOXES,
  low_stock_threshold: DEFAULT_LOW_STOCK_THRESHOLD,
  monthly_order_limit_boxes: DEFAULT_MONTHLY_ORDER_LIMIT_BOXES,
  updated_at: new Date(0).toISOString(),
};

/**
 * Reads the single site_settings row (server-side only). Falls back to
 * hardcoded defaults if the row is missing or the request fails, so a
 * database hiccup never breaks the WhatsApp link or pickup address for
 * customers — it just serves slightly stale values until it recovers.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return FALLBACK_SETTINGS;
  }

  return data as SiteSettings;
}
