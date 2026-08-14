"use client";

import { createClient } from "@/lib/supabase/client";
import type { CartState } from "@/lib/cart-context";
import type { DeliveryMethod } from "@/lib/order-utils";

export interface SubmitOrderInput {
  cart: CartState;
  customerName: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  address: string;
  notes?: string;
}

export interface SubmitOrderResult {
  orderId: string;
  orderNumber: string;
}

/**
 * Writes the order to Supabase via the `create_order` Postgres function
 * (see 1_create_order_function.sql) so it shows up in the admin panel
 * immediately. This runs as a single RPC rather than two client-side
 * inserts because the site has no customer accounts — `anon` never gets
 * direct table access to `orders`/`order_items`, only permission to call
 * this one function, which validates and writes both rows in one
 * transaction (automatic rollback if anything fails, no manual cleanup
 * needed here).
 */
export async function submitOrder({
  cart,
  customerName,
  customerPhone,
  deliveryMethod,
  address,
  notes = "",
}: SubmitOrderInput): Promise<SubmitOrderResult> {
  const lines = Object.values(cart);
  if (lines.length === 0) {
    throw new Error("Cannot submit an empty order.");
  }

  const supabase = createClient();
  const totalAmount = lines.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );

  const items = lines.map((line) => ({
    menu_item_id: line.id,
    item_name: line.name,
    quantity_boxes: line.quantity,
    price_at_order: line.price,
  }));

  const { data, error } = await supabase
    .rpc("create_order", {
      p_customer_name: customerName.trim(),
      p_customer_phone: customerPhone.trim(),
      p_collection_type: deliveryMethod,
      p_delivery_address: deliveryMethod === "delivery" ? address.trim() : null,
      p_notes: notes.trim() || null,
      p_total_amount: totalAmount,
      p_items: items,
    })
    .single<{ order_id: string; order_number: string }>();

  if (error || !data) {
    console.error("Failed to create order:", describeSupabaseError(error));
    throw new Error(
      "We couldn't save your order. Please check your connection and try again.",
    );
  }

  return { orderId: data.order_id, orderNumber: data.order_number };
}

/**
 * Supabase's PostgrestError doesn't always print usefully via
 * console.error (it can show up as `{}` in Next.js's dev overlay), so pull
 * out the fields that actually explain what went wrong — message, error
 * code, details, and hint — for real debugging.
 */
function describeSupabaseError(error: unknown) {
  if (!error || typeof error !== "object") return error;
  const e = error as {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  };
  return {
    message: e.message ?? "(no message)",
    code: e.code ?? "(no code)",
    details: e.details ?? "(no details)",
    hint: e.hint ?? "(no hint)",
  };
}
