"use client";

import MenuOrderList from "./MenuOrderList";
import OrderSummary from "./OrderSummary";
import type { MenuCategoryGroup } from "@/lib/types";

interface OrderPageClientProps {
  menu: MenuCategoryGroup[];
}

export default function OrderPageClient({ menu }: OrderPageClientProps) {
  return (
    <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[1fr_360px] lg:gap-14 lg:py-20">
      <div>
        <h1 className="font-nunito text-4xl font-extrabold tracking-[-0.06em] text-[#1F1A17] sm:text-5xl">
          Build Your Box
        </h1>
        <p className="mt-3 max-w-[520px] text-base text-[#1F1A17] sm:text-lg">
          Pick your favourites and add them to your box.
        </p>

        <div className="mt-10">
          {menu.length === 0 ? (
            <p className="rounded-3xl border border-[#1F1A17]/10 bg-white/60 px-5 py-8 text-center text-[#7A6F68]">
              Our menu is being updated — please check back shortly, or reach
              out to us on WhatsApp.
            </p>
          ) : (
            <MenuOrderList menu={menu} />
          )}
        </div>
      </div>

      {/* Desktop only — on mobile, the cart icon in the navbar opens the
          same summary in a bottom sheet instead of showing it inline. */}
      <div className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
        <OrderSummary />
      </div>
    </div>
  );
}
