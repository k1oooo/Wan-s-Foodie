import type { Category, OrderStatus, PaymentStatus } from "./types";

// Consistent category color-coding, used everywhere a menu item or
// order line item appears (Menu CRUD, Order detail, Dashboard top-sellers).
export const CATEGORY_STYLE: Record<
  Category,
  { label: string; dot: string; badge: string }
> = {
  chicken: {
    label: "Chicken",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  },
  beef: {
    label: "Beef",
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
  },
  seafood: {
    label: "Seafood",
    dot: "bg-sky-500",
    badge: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
  },
};

export const ORDER_STATUS_STYLE: Record<
  OrderStatus,
  { label: string; badge: string }
> = {
  pending: {
    label: "Pending",
    badge: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300",
  },
  confirmed: {
    label: "Confirmed",
    badge: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
  },
  preparing: {
    label: "Preparing",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  },
  ready: {
    label: "Ready",
    badge: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
  },
  completed: {
    label: "Completed",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  },
  refunded: {
    label: "Refunded",
    badge: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
  },
};

export const PAYMENT_STATUS_STYLE: Record<
  PaymentStatus,
  { label: string; badge: string }
> = {
  unpaid: {
    label: "Unpaid",
    badge: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  },
  paid: {
    label: "Paid",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  },
  refunded: {
    label: "Refunded",
    badge: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
  },
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "cancelled",
  "refunded",
];
