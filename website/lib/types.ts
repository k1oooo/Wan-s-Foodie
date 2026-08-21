// Mirrors the Supabase schema (menu_items, orders, order_items)

export type Category = "chicken" | "beef" | "seafood";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  price_per_box: number;
  stock_boxes: number;
  is_available: boolean;
  is_chef_recommended: boolean;
  sort_order: number;
}

/**
 * Public-facing menu item.
 *
 * Kept separate from MenuItem so the public menu can have its own
 * type if the fields exposed to customers change later.
 */
export type PublicMenuItem = MenuItem;

/**
 * A category of menu items displayed on the public ordering page.
 */
export interface MenuCategoryGroup {
  category: Category;
  label: string;
  items: PublicMenuItem[];
}

export interface OrderItem {
  id: string;
  menu_item_id: string | null;
  item_name: string;
  quantity_boxes: number;
  price_at_order: number;
  subtotal: number;
}

// Mirrors the `regular_customers` Supabase view
export interface RegularCustomer {
  customer_phone: string;
  customer_name: string;
  total_orders: number;
  lifetime_spend: number;
  last_order_at: string;
}

// Mirrors the `site_settings` Supabase table (a single row, id always 1)
export interface SiteSettings {
  id: number;
  business_email: string;
  contact_phone: string;
  pickup_address: string;
  preorder_minimum_boxes: number;
  low_stock_threshold: number;
  monthly_order_limit_boxes: number;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  collection_type: "pickup" | "delivery";
  delivery_address?: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  notes?: string | null;
  created_at: string;

  /**
   * Set when status is changed to "completed" or "cancelled"; cleared if
   * it's moved to any other status. Drives the 24h edit-lock window —
   * see app/admin/_lib/order-lock.ts.
   */
  status_finalized_at: string | null;

  items: OrderItem[];
}
