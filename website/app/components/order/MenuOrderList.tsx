"use client";

import { Minus, Plus } from "lucide-react";
import { menuData } from "@/lib/menu-data";
import { formatRM } from "@/lib/order-utils";
import { useCart } from "@/lib/cart-context";

export default function MenuOrderList() {
  const { cart, setQuantity } = useCart();

  return (
    <div className="space-y-10">
      {menuData.map((category) => (
        <div key={category.category}>
          <h2 className="font-nunito text-2xl font-extrabold tracking-[-0.04em] text-[#1F1A17] sm:text-3xl">
            {category.category}
          </h2>
          <ul className="mt-4 divide-y divide-[#1F1A17]/10 rounded-3xl border border-[#1F1A17]/10 bg-white/60">
            {category.items.map((item) => {
              const qty = cart[item.name] ?? 0;
              return (
                <li
                  key={item.name}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-nunito text-lg font-extrabold tracking-[-0.02em] text-[#1F1A17]">
                      {item.name}
                    </p>
                    <p className="text-sm text-[#7A6F68]">
                      {formatRM(item.price)} / box of 10 pcs
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(item.name, Math.max(0, qty - 1))
                      }
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
                      onClick={() => setQuantity(item.name, qty + 1)}
                      aria-label={`Increase ${item.name} quantity`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C1442D] text-[#FBF7F2] transition-opacity hover:opacity-90"
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
