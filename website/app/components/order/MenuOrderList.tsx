"use client";

import { ChefHat, Minus, Plus } from "lucide-react";
import { formatRM } from "@/lib/order-utils";
import { useCart } from "@/lib/cart-context";
import { getStockState } from "@/lib/stock";
import StockBadge from "./StockBadge";
import type { MenuCategoryGroup, PublicMenuItem } from "@/lib/types";

interface MenuOrderListProps {
  menu: MenuCategoryGroup[];
  /** From live site settings (Admin > Settings). */
  lowStockThreshold: number;
  preorderMinimumBoxes: number;
}

export default function MenuOrderList({
  menu,
  lowStockThreshold,
  preorderMinimumBoxes,
}: MenuOrderListProps) {
  const { cart, setQuantity } = useCart();

  function addOne(item: PublicMenuItem, currentQty: number) {
    const state = getStockState(item, lowStockThreshold);
    let nextQty: number;

    if (state === "unavailable") {
      return;
    } else if (state === "preorder") {
      // Out of stock but still enabled — jump straight to the pre-order
      // minimum on the first tap instead of incrementing by 1, since
      // anything below the minimum isn't a valid pre-order quantity.
      nextQty =
        currentQty === 0 ? preorderMinimumBoxes : currentQty + 1;
    } else {
      nextQty = Math.min(currentQty + 1, item.stock_boxes);
    }

    setQuantity(
      {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price_per_box,
      },
      nextQty,
    );
  }

  function removeOne(item: PublicMenuItem, currentQty: number) {
    const state = getStockState(item, lowStockThreshold);
    // At or below the pre-order minimum, the only valid step down is to
    // remove the item entirely — there's no such thing as "2 boxes" of a
    // 3-box-minimum pre-order.
    const nextQty =
      state === "preorder" && currentQty <= preorderMinimumBoxes
        ? 0
        : Math.max(0, currentQty - 1);

    setQuantity(
      {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price_per_box,
      },
      nextQty,
    );
  }

  return (
    <div className="space-y-10">
      {menu.map((group) => (
        <div key={group.category}>
          <h2 className="font-nunito text-2xl font-extrabold tracking-[-0.04em] text-[#1F1A17] sm:text-3xl">
            {group.label}
          </h2>
          <ul className="mt-4 divide-y divide-[#1F1A17]/10 rounded-3xl border border-[#1F1A17]/10 bg-white/60">
            {group.items.map((item) => {
              const qty = cart[item.id]?.quantity ?? 0;
              const state = getStockState(item, lowStockThreshold);
              const unavailable = state === "unavailable";
              const atStockLimit =
                state !== "preorder" && qty >= item.stock_boxes;

              return (
                <li
                  key={item.id}
                  className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                    unavailable ? "opacity-50" : ""
                  }`}
                >
                  <div>
                    <p className="flex items-center gap-1.5 font-nunito text-lg font-extrabold tracking-[-0.02em] text-[#1F1A17]">
                      {item.name}
                      {item.is_chef_recommended && (
                        <ChefHat
                          size={16}
                          className="shrink-0 text-[#E3A73B]"
                          aria-label="Chef's recommendation"
                        />
                      )}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-[#7A6F68]">
                      <span>
                        {unavailable
                          ? "Sold out"
                          : `${formatRM(item.price_per_box)} / box of 10 pcs`}
                      </span>
                      <StockBadge
                        state={state}
                        stockBoxes={item.stock_boxes}
                        preorderMinimumBoxes={preorderMinimumBoxes}
                      />
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => removeOne(item, qty)}
                      disabled={qty === 0}
                      aria-label={`Decrease ${item.name} quantity`}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#C1442D] text-[#C1442D] transition-opacity disabled:opacity-30"
                    >
                      <Minus size={16} />
                    </button>
                    <span
                      className="w-6 text-center font-nunito text-lg font-extrabold text-[#1F1A17]"
                      aria-live="polite"
                    >
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => addOne(item, qty)}
                      disabled={unavailable || atStockLimit}
                      aria-label={`Increase ${item.name} quantity`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C1442D] text-[#FBF7F2] transition-opacity hover:opacity-90 disabled:opacity-30"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

