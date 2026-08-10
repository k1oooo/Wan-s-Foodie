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
 * Writes the order to Supabase (`orders` + `order_items`) so it shows up in
 * the admin panel immediately. Runs as two inserts rather than a single RPC
 * because the site has no customer accounts — this needs INSERT policies
 * that allow anonymous writes to `orders` and `order_items` (see the SQL
 * notes shared alongside this integration). Stock decrement is left to the
 * existing `order_items` trigger rather than duplicated here.
 *
 * If the order_items insert fails after the order row was created, the
 * order is deleted as a best-effort rollback so it doesn't show up as an
 * empty phantom order in the admin panel.
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

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      collection_type: deliveryMethod,
      delivery_address: deliveryMethod === "delivery" ? address.trim() : null,
      notes: notes.trim() || null,
      status: "pending",
      payment_status: "unpaid",
      total_amount: totalAmount,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    console.error("Failed to create order:", describeSupabaseError(orderError));
    throw new Error(
      "We couldn't save your order. Please check your connection and try again.",
    );
  }

  const orderItems = lines.map((line) => ({
    order_id: order.id,
    menu_item_id: line.id,
    item_name: line.name,
    quantity_boxes: line.quantity,
    price_at_order: line.price,
    // subtotal is intentionally omitted — it's a generated column in
    // Supabase (price_at_order * quantity_boxes), computed by the DB.
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error(
      "Failed to create order items:",
      describeSupabaseError(itemsError),
    );
    // Best-effort rollback so a failed order doesn't linger as an empty row.
    await supabase.from("orders").delete().eq("id", order.id);
    throw new Error(
      "We couldn't save your order items. Please try again — nothing was charged.",
    );
  }

  return { orderId: order.id, orderNumber: order.order_number };
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
