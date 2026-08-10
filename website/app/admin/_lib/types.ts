// Mirrors the Supabase schema (menu_items, orders, order_items)

export type Category = "chicken" | "beef" | "seafood";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid";

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  price_per_box: number;
  stock_boxes: number;
  is_available: boolean;
  image_url?: string | null;
  sort_order: number;
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
   * it's moved to any other status. Drives the 24h edit-lock window — see
   * app/admin/_lib/order-lock.ts.
   */
  status_finalized_at: string | null;
  items: OrderItem[];
}
