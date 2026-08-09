"use client";

import CartItemsCard from "./CartItemsCard";
import OrderDetailsForm from "./OrderDetailsForm";

export default function PaymentPageClient() {
  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col px-6 py-6 sm:px-10 lg:h-full lg:py-6">
      <h1 className="shrink-0 text-center font-nunito text-2xl font-extrabold tracking-[-0.06em] text-[#1F1A17] sm:text-3xl">
        Order Information
      </h1>

      {/* Each column scrolls independently as a safety net — the goal is that
          neither column needs to scroll on a normal screen, but if the cart
          has many items or a validation message appears, that column scrolls
          on its own instead of pushing the Send Order button off-screen. */}
      <div className="mt-5 grid flex-1 grid-cols-1 gap-6 lg:min-h-0 lg:grid-cols-[1fr_380px] lg:gap-8">
        <div className="lg:min-h-0 lg:overflow-y-auto lg:pr-2">
          <CartItemsCard />
        </div>
        <div className="lg:min-h-0 lg:overflow-y-auto lg:pr-1">
          <OrderDetailsForm />
        </div>
      </div>
    </div>
  );
}
