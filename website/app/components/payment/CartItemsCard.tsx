"use client";

import { Minus, Plus, X } from "lucide-react";
import Button from "@/app/ui/Button";
import { useCart } from "@/lib/cart-context";
import { formatRM } from "@/lib/order-utils";
import { menuData } from "@/lib/menu-data";

function getItemPrice(itemName: string): number {
  for (const category of menuData) {
    const match = category.items.find((item) => item.name === itemName);
    if (match) return match.price;
  }
  return 0;
}

export default function CartItemsCard() {
  const { cart, setQuantity, removeItem } = useCart();
  const items = Object.entries(cart).filter(([, qty]) => qty > 0);
  const itemCount = items.reduce((sum, [, qty]) => sum + qty, 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-nunito text-lg font-extrabold tracking-[-0.03em] text-[#1F1A17] sm:text-xl">
          Your Items{" "}
          {itemCount > 0 && (
            <span className="text-[#7A6F68]">
              ({itemCount} box{itemCount === 1 ? "" : "es"})
            </span>
          )}
        </h2>

        {items.length > 0 && (
          <Button
            href="/order"
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            <Plus size={14} /> Add More Items
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-[#1F1A17]/10 bg-white px-6 py-8 text-center">
          <p className="text-[#7A6F68]">Your cart is empty.</p>
          <Button href="/order" size="sm" className="mt-4">
            Browse Menu
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map(([name, qty]) => {
            const price = getItemPrice(name);
            return (
              <div
                key={name}
                className="flex items-center gap-3 rounded-2xl border border-[#1F1A17]/10 bg-white px-4 py-3"
              >
                <div
                  aria-hidden="true"
                  className="h-11 w-11 shrink-0 rounded-xl bg-[#E3A73B]"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-nunito text-sm font-extrabold tracking-[-0.02em] text-[#1F1A17] sm:text-base">
                    {name}
                  </p>
                  <p className="text-xs text-[#7A6F68] sm:text-sm">
                    {formatRM(price)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuantity(name, Math.max(0, qty - 1))}
                    aria-label={`Decrease ${name} quantity`}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#C1442D] text-[#C1442D]"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-5 text-center font-nunito text-sm font-extrabold text-[#1F1A17]">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(name, qty + 1)}
                    aria-label={`Increase ${name} quantity`}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C1442D] text-[#FBF7F2]"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(name)}
                  aria-label={`Remove ${name} from cart`}
                  className="shrink-0 text-[#7A6F68] transition-colors hover:text-[#C1442D]"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
