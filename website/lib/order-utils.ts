import type { CartLine, CartState } from "@/lib/cart-context";
import { PICKUP_ADDRESS } from "@/lib/site-config";

export type DeliveryMethod = "pickup" | "delivery";

export function formatRM(amount: number) {
  return `RM${amount.toFixed(2).replace(/\.00$/, "")}`;
}

export function getCartTotal(cart: CartState): number {
  return Object.values(cart).reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );
}

export function getCartItemCount(cart: CartState): number {
  return Object.values(cart).reduce((sum, line) => sum + line.quantity, 0);
}

const CATEGORY_LABELS: Record<CartLine["category"], string> = {
  chicken: "Chicken",
  beef: "Beef",
  seafood: "Seafood",
};

export interface CheckoutDetails {
  cart: CartState;
  deliveryMethod: DeliveryMethod;
  address: string;
  customerName: string;
  customerPhone: string;
  notes: string;
  orderNumber?: string;
}

export function buildOrderMessage({
  cart,
  deliveryMethod,
  address,
  customerName,
  customerPhone,
  notes,
  orderNumber,
}: CheckoutDetails): string {
  const lines: string[] = [];

  lines.push("Hi Wan's Foodies! I'd like to place an order:");
  if (orderNumber) {
    lines.push(`*Order #: ${orderNumber}*`);
  }
  lines.push("");

  const byCategory = new Map<CartLine["category"], CartLine[]>();
  for (const line of Object.values(cart)) {
    const list = byCategory.get(line.category) ?? [];
    list.push(line);
    byCategory.set(line.category, list);
  }

  for (const [category, items] of byCategory) {
    lines.push(`*${CATEGORY_LABELS[category] ?? category}*`);
    for (const item of items) {
      lines.push(
        `- ${item.name} x${item.quantity} box(es) — ${formatRM(item.price * item.quantity)}`,
      );
    }
    lines.push("");
  }

  lines.push(`*Total: ${formatRM(getCartTotal(cart))}*`);
  lines.push("");
  lines.push(
    `*Fulfilment:* ${deliveryMethod === "pickup" ? "Self pickup" : "Delivery"}`,
  );
  if (deliveryMethod === "pickup") {
    lines.push(`*Pickup address:* ${PICKUP_ADDRESS}`);
  }
  if (deliveryMethod === "delivery" && address.trim()) {
    lines.push(`*Delivery address:* ${address.trim()}`);
  }
  lines.push("");
  lines.push(`*Name:* ${customerName.trim()}`);
  lines.push(`*Phone:* ${customerPhone.trim()}`);
  if (notes.trim()) {
    lines.push(`*Notes:* ${notes.trim()}`);
  }
  lines.push("");
  lines.push("I'll pay via DuitNow QR once confirmed. Thank you!");

  return lines.join("\n");
}
