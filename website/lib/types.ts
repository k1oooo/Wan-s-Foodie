// Shared types for the customer-facing site. Mirrors the Supabase schema
// (menu_items, orders, order_items) — see app/admin/_lib/types.ts for the
// admin-panel equivalent, which this intentionally overlaps with.

export type Category = "chicken" | "beef" | "seafood";

export interface PublicMenuItem {
  id: string;
  name: string;
  category: Category;
  price_per_box: number;
  stock_boxes: number;
  is_available: boolean;
  is_chef_recommended: boolean;
  sort_order: number;
}

export interface MenuCategoryGroup {
  category: Category;
  label: string;
  items: PublicMenuItem[];
}
