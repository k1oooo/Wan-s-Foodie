import { createClient } from "@/lib/supabase/server";
import type { Category, MenuCategoryGroup, PublicMenuItem } from "@/lib/types";

const CATEGORY_LABELS: Record<Category, string> = {
  chicken: "Chicken",
  beef: "Beef",
  seafood: "Seafood",
};

const CATEGORY_ORDER: Category[] = ["chicken", "beef", "seafood"];

/**
 * Fetches the live menu from Supabase, grouped by category in the fixed
 * chicken → beef → seafood order. Server-only (uses the server Supabase
 * client), so call this from Server Components / route handlers and pass
 * the result down as props to any client components that need it.
 *
 * Returns an empty array (rather than throwing) if the fetch fails, so a
 * transient Supabase issue doesn't take down the homepage or order page —
 * callers should render an empty-state rather than crash.
 */
export async function getPublicMenu(): Promise<MenuCategoryGroup[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("menu_items")
    .select(
      "id, name, category, price_per_box, stock_boxes, is_available, image_url, sort_order",
    )
    .order("sort_order");

  if (error || !data) {
    console.error("Failed to load menu items from Supabase:", error);
    return [];
  }

  const items = data as PublicMenuItem[];
  const grouped = new Map<Category, PublicMenuItem[]>();
  for (const item of items) {
    const list = grouped.get(item.category) ?? [];
    list.push(item);
    grouped.set(item.category, list);
  }

  return CATEGORY_ORDER.filter((category) => grouped.has(category)).map(
    (category) => ({
      category,
      label: CATEGORY_LABELS[category],
      items: grouped.get(category)!,
    }),
  );
}
