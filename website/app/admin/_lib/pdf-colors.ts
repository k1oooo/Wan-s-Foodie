import type { Category, OrderStatus, PaymentStatus } from "./types";

export type RGB = [number, number, number];

// Wan's Foodies brand palette (customer-facing site) plus the admin's
// neutral slate tones, as RGB triples for jsPDF (which doesn't understand
// hex/Tailwind classes).
export const PDF_BRAND = {
  terracotta: [193, 68, 45] as RGB,
  gold: [227, 167, 59] as RGB,
  cream: [251, 247, 242] as RGB,
  nearBlack: [31, 26, 23] as RGB,
  muted: [122, 111, 104] as RGB,
  white: [255, 255, 255] as RGB,
  slate200: [226, 232, 240] as RGB,
};

// Mirrors CATEGORY_STYLE's amber/rose/sky badge colors from category-style.ts
export const CATEGORY_PDF_COLORS: Record<Category, { bg: RGB; text: RGB }> = {
  chicken: { bg: [255, 251, 235], text: [180, 83, 9] },
  beef: { bg: [255, 241, 242], text: [190, 18, 60] },
  seafood: { bg: [240, 249, 255], text: [3, 105, 161] },
};

// Mirrors ORDER_STATUS_STYLE's badge colors from category-style.ts
export const ORDER_STATUS_PDF_COLORS: Record<
  OrderStatus,
  { bg: RGB; text: RGB }
> = {
  pending: { bg: [241, 245, 249], text: [51, 65, 85] },
  confirmed: { bg: [238, 242, 255], text: [67, 56, 202] },
  preparing: { bg: [255, 251, 235], text: [180, 83, 9] },
  ready: { bg: [240, 249, 255], text: [3, 105, 161] },
  completed: { bg: [236, 253, 245], text: [4, 120, 87] },
  cancelled: { bg: [254, 242, 242], text: [185, 28, 28] },
  refunded: { bg: [250, 245, 255], text: [126, 34, 206] },
};

// Mirrors PAYMENT_STATUS_STYLE's badge colors from category-style.ts
export const PAYMENT_STATUS_PDF_COLORS: Record<
  PaymentStatus,
  { bg: RGB; text: RGB }
> = {
  unpaid: { bg: [254, 242, 242], text: [185, 28, 28] },
  paid: { bg: [236, 253, 245], text: [4, 120, 87] },
  refunded: { bg: [250, 245, 255], text: [126, 34, 206] },
};
