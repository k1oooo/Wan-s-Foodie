/**
 * Stock status for a menu item, derived from its stock count and the
 * admin-configured low-stock threshold.
 *
 * - "unavailable": admin has hidden the item (is_available = false) —
 *   a hard stop regardless of stock count, distinct from being sold out.
 * - "preorder": in-stock count has hit 0, but the item is still enabled —
 *   orderable at or above the pre-order minimum instead of being blocked.
 * - "low-stock": at or below the low-stock threshold, but still orderable
 *   at normal quantities.
 * - "in-stock": comfortably stocked.
 */
export type StockState = "unavailable" | "preorder" | "low-stock" | "in-stock";

export function getStockState(
  item: { stock_boxes: number; is_available: boolean },
  lowStockThreshold: number,
): StockState {
  if (!item.is_available) return "unavailable";
  if (item.stock_boxes <= 0) return "preorder";
  if (item.stock_boxes <= lowStockThreshold) return "low-stock";
  return "in-stock";
}
