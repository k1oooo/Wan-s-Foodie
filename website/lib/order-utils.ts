import { menuData } from "@/lib/menu-data";

export type DeliveryMethod = "pickup" | "delivery";

export type CartState = Record<string, number>; // key: item name, value: quantity of boxes

export function formatRM(amount: number) {
  return `RM${amount.toFixed(2).replace(/\.00$/, "")}`;
}

export function getCartTotal(cart: CartState): number {
  let total = 0;
  for (const category of menuData) {
    for (const item of category.items) {
      const qty = cart[item.name] ?? 0;
      total += qty * item.price;
    }
  }
  return total;
}

export function getCartItemCount(cart: CartState): number {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

export interface CheckoutDetails {
  cart: CartState;
  deliveryMethod: DeliveryMethod;
  address: string;
  customerName: string;
  customerPhone: string;
  notes: string;
}

export function buildOrderMessage({
  cart,
  deliveryMethod,
  address,
  customerName,
  customerPhone,
  notes,
}: CheckoutDetails): string {
  const lines: string[] = [];

  lines.push("Hi Wan's Foodies! I'd like to place an order:");
  lines.push("");

  for (const category of menuData) {
    const itemsInCategory = category.items.filter((item) => (cart[item.name] ?? 0) > 0);
    if (itemsInCategory.length === 0) continue;

    lines.push(`*${category.category}*`);
    for (const item of itemsInCategory) {
      const qty = cart[item.name];
      lines.push(`- ${item.name} x${qty} box(es) — ${formatRM(item.price * qty)}`);
    }
    lines.push("");
  }

  lines.push(`*Total: ${formatRM(getCartTotal(cart))}*`);
  lines.push("");
  lines.push(
    `*Fulfilment:* ${deliveryMethod === "pickup" ? "Self pickup" : "Delivery"}`
  );
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
