"use client";

import MenuOrderList from "./MenuOrderList";
import OrderSummary from "./OrderSummary";

export default function OrderPageClient() {
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
          <MenuOrderList />
        </div>
      </div>

      <div className="lg:sticky lg:top-28 lg:self-start">
        <OrderSummary />
      </div>
    </div>
  );
}
