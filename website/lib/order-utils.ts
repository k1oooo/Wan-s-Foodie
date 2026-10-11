import type { CartLine, CartState } from "@/lib/cart-context";

export type DeliveryMethod = "pickup" | "delivery";

// Lives here (not in OrderInvoice.tsx, where it conceptually "belongs")
// specifically so lib/receipt-pdf.ts can import it without creating a
// circular dependency between a UI component and a lib module.
export type ReceiptItem = Pick<CartLine, "id" | "name" | "price" | "quantity">;

export interface ConfirmedOrder {
  orderNumber: string;
  items: ReceiptItem[];
  /** Items subtotal only — delivery fee is carried separately below. */
  total: number;
  customerName: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  address: string;
  sentAt: string;
  /** Delivery orders only. Either the distance-based estimate shown at
   * checkout (deliveryFeeIsEstimate: true) or the fee the admin has set
   * (false). null/undefined = no figure yet ("to be confirmed"). */
  deliveryFee?: number | null;
  deliveryFeeIsEstimate?: boolean;
  deliveryDistanceKm?: number | null;
  /** Only passed for admin-generated receipts; the customer's own copy
   * (generated before payment) leaves it unset. */
  paymentStatus?: "unpaid" | "paid" | "refunded";
}

/**
 * Shared by the on-screen confirmation and the PDF receipt so both always
 * show the same figures. For delivery orders the total only includes the
 * fee when there is one; otherwise it's labelled as excluding delivery.
 */
export function getReceiptTotals(order: ConfirmedOrder) {
  const isDelivery = order.deliveryMethod === "delivery";
  const fee = isDelivery ? (order.deliveryFee ?? null) : null;
  const isEstimate = order.deliveryFeeIsEstimate ?? true;
  const feeLabel = isEstimate ? "Estimated delivery fee" : "Delivery fee";

  let feeValue = "To be confirmed";
  if (fee != null && (fee > 0 || !isEstimate)) {
    feeValue = formatRM(fee);
    if (isEstimate && order.deliveryDistanceKm != null) {
      feeValue += ` (~${order.deliveryDistanceKm}km)`;
    }
  }
  const hasFee = fee != null && (fee > 0 || !isEstimate);

  return {
    isDelivery,
    feeLabel,
    feeValue,
    hasFee,
    isEstimate,
    totalLabel: !isDelivery
      ? "Total"
      : hasFee
        ? isEstimate
          ? "Estimated total"
          : "Total"
        : "Total (excl. delivery)",
    totalAmount: order.total + (hasFee ? fee! : 0),
  };
}

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
  /** Pulled from live site settings so it stays in sync with what Admin
   * has configured, rather than a hardcoded constant. */
  pickupAddress: string;
  /** Distance-based ESTIMATE only, shown to Wan as a heads-up — the real
   * delivery fee is still confirmed manually over WhatsApp. Omitted from
   * the message entirely if the estimate couldn't be calculated. */
  estimatedDeliveryFee?: number | null;
  estimatedDistanceKm?: number | null;
}

const MESSAGE_DIVIDER = "━━━━━━━━━━━━━━";

export function buildOrderMessage({
  cart,
  deliveryMethod,
  address,
  customerName,
  customerPhone,
  notes,
  orderNumber,
  pickupAddress,
  estimatedDeliveryFee,
  estimatedDistanceKm,
}: CheckoutDetails): string {
  const lines: string[] = [];
  const isDelivery = deliveryMethod === "delivery";
  const subtotal = getCartTotal(cart);
  const hasFee = isDelivery && estimatedDeliveryFee != null;

  // ---- Header ----
  lines.push("Hi Wan's Foodies! I'd like to place an order 🍗");
  if (orderNumber) {
    lines.push("");
    lines.push(`*Order #${orderNumber}*`);
  }
  lines.push(MESSAGE_DIVIDER);

  // ---- Items, grouped by category ----
  lines.push("*🧾 ORDER*");

  const byCategory = new Map<CartLine["category"], CartLine[]>();
  for (const line of Object.values(cart)) {
    const list = byCategory.get(line.category) ?? [];
    list.push(line);
    byCategory.set(line.category, list);
  }

  for (const [category, items] of byCategory) {
    lines.push("");
    lines.push(`_${CATEGORY_LABELS[category] ?? category}_`);
    for (const item of items) {
      const preorderTag = item.isPreorder ? " (Pre-order)" : "";
      lines.push(
        `• ${item.name} × ${item.quantity} — ${formatRM(item.price * item.quantity)}${preorderTag}`,
      );
    }
  }

  const preorderItems = Object.values(cart).filter((line) => line.isPreorder);
  if (preorderItems.length > 0) {
    lines.push("");
    lines.push(
      `⚠️ ${preorderItems.length === 1 ? "1 item is" : `${preorderItems.length} items are`} on pre-order and will be fulfilled once restocked.`,
    );
  }
  lines.push(MESSAGE_DIVIDER);

  // ---- Totals ----
  if (isDelivery) {
    lines.push(`Subtotal: ${formatRM(subtotal)}`);
    if (hasFee) {
      const distance =
        estimatedDistanceKm != null ? ` (~${estimatedDistanceKm}km)` : "";
      lines.push(
        `Delivery fee (est.): ${formatRM(estimatedDeliveryFee!)}${distance}`,
      );
      lines.push(
        `*Total (est.): ${formatRM(subtotal + estimatedDeliveryFee!)}*`,
      );
    } else {
      lines.push("Delivery fee: to be confirmed");
      lines.push(`*Total (excl. delivery): ${formatRM(subtotal)}*`);
    }
  } else {
    lines.push(`*Total: ${formatRM(subtotal)}*`);
  }
  lines.push(MESSAGE_DIVIDER);

  // ---- Fulfilment ----
  if (isDelivery) {
    lines.push("*🛵 DELIVERY*");
    if (address.trim()) {
      lines.push(address.trim());
    }
    if (hasFee) {
      lines.push("_Delivery fee is an estimate and will be confirmed._");
    }
  } else {
    lines.push("*🏪 SELF PICKUP*");
    lines.push(pickupAddress);
  }
  lines.push(MESSAGE_DIVIDER);

  // ---- Customer ----
  lines.push("*👤 CUSTOMER*");
  lines.push(`Name: ${customerName.trim()}`);
  lines.push(`Phone: ${customerPhone.trim()}`);
  if (notes.trim()) {
    lines.push(`Notes: ${notes.trim()}`);
  }
  lines.push("");
  lines.push("I'll pay via DuitNow QR once confirmed. Thank you! 🙏");

  return lines.join("\n");
}
