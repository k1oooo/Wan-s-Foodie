"use client";

import { ShoppingBag, X } from "lucide-react";
import Button from "@/app/ui/Button";
import { useCart } from "@/lib/cart-context";
import { formatRM } from "@/lib/order-utils";

export default function OrderSummary() {
  const { cart, removeItem, totalBoxes, totalPrice } = useCart();
  const items = Object.entries(cart).filter(([, qty]) => qty > 0);
  const hasItems = totalBoxes > 0;

  return (
    <div className="rounded-[32px] border-2 border-dashed border-[#1F1A17]/20 bg-[#FBF7F2] p-6 shadow-sm sm:p-8">
      <h2 className="flex items-center gap-2 font-nunito text-xl font-extrabold tracking-[-0.03em] text-[#1F1A17]">
        <ShoppingBag size={20} /> Order Summary
      </h2>

      {/* Itemized list of what's been added, each removable */}
      <div className="mt-5 space-y-2 border-b border-dashed border-[#1F1A17]/20 pb-5">
        {hasItems ? (
          items.map(([name, qty]) => (
            <div
              key={name}
              className="flex items-center justify-between gap-3 text-sm text-[#1F1A17] sm:text-base"
            >
              <span className="min-w-0 truncate">
                {name} <span className="text-[#7A6F68]">x{qty}</span>
              </span>
              <button
                type="button"
                onClick={() => removeItem(name)}
                aria-label={`Remove ${name} from order`}
                className="shrink-0 text-[#7A6F68] transition-colors hover:text-[#C1442D]"
              >
                <X size={16} />
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#7A6F68]">
            No items yet — add some curry puffs!
          </p>
        )}
      </div>

      <div className="mt-5 space-y-3 border-b border-dashed border-[#1F1A17]/20 pb-5 text-[#1F1A17]">
        <div className="flex items-center justify-between text-base sm:text-lg">
          <span>Total boxes</span>
          <span className="font-nunito font-extrabold">{totalBoxes}</span>
        </div>
        <div className="flex items-center justify-between font-nunito text-lg font-extrabold sm:text-xl">
          <span>Total price</span>
          <span className="text-[#C1442D]">{formatRM(totalPrice)}</span>
        </div>
      </div>

      {hasItems ? (
        <Button href="/payment" className="mt-6 w-full">
          Proceed to Payment
        </Button>
      ) : (
        <Button disabled className="mt-6 w-full">
          Proceed to Payment
        </Button>
      )}
      {!hasItems && (
        <p className="mt-2 text-center text-xs text-[#7A6F68]">
          Add at least one box to continue.
        </p>
      )}
    </div>
  );
}
