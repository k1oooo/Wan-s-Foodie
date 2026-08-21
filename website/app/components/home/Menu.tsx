import { ChefHat } from "lucide-react";
import { getPublicMenu } from "@/lib/menu";
import { formatRM } from "@/lib/order-utils";
import { getSiteSettings } from "@/lib/supabase/settings";
import { getStockState } from "@/lib/stock";
import StockBadge from "@/app/components/order/StockBadge";

export default async function Menu() {
  const [menu, settings] = await Promise.all([
    getPublicMenu(),
    getSiteSettings(),
  ]);

  return (
    <section
      id="menu"
      className="scroll-mt-24 bg-[#FBF7F2] px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
    >
      <div className="mx-auto w-full max-w-[1240px]">
        {/* Heading */}
        <div className="text-left">
          <span className="font-nunito text-sm font-extrabold uppercase tracking-[0.18em] text-[#C1442D]">
            What&apos;s Cooking
          </span>

          <h2 className="mt-3 font-nunito text-4xl font-extrabold tracking-[-0.06em] text-[#1F1A17] sm:text-5xl lg:text-6xl">
            Our Menu
          </h2>

          <p className=" mt-4 max-w-xl text-base leading-6 text-[#1F1A17]/60">
            Pick your favourite flavours. Every box comes packed with 10
            delicious curry puffs, ready for your freezer.
          </p>
        </div>

        {menu.length === 0 ? (
          <p className="mt-12 text-center text-[#7A6F68]">
            Our menu is being updated — please check back shortly, or reach out
            to us on WhatsApp.
          </p>
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {menu.map((group) => (
              // "Menu ticket": a terracotta header band with a scalloped
              // tear edge into a cream body — the printed hawker-menu feel
              // this section is going for, built from the same
              // cream/terracotta/gold tokens used across the rest of the
              // site rather than a new palette.
              <div
                key={group.category}
                className="overflow-hidden rounded-[28px] border-2 border-[#C1442D] bg-[#FBF7F2] shadow-sm"
              >
                <div className="bg-[#C1442D] px-6 pb-4 pt-5">
                  <h3 className="flex items-center justify-center gap-2.5 font-nunito text-xl font-extrabold uppercase tracking-[0.06em] text-[#FBF7F2]">
                    {group.label}
                  </h3>
                </div>

                <ul className="flex flex-col gap-3 px-6 pb-6 pt-5 sm:px-7">
                  {group.items.map((item) => {
                    const state = getStockState(
                      item,
                      settings.low_stock_threshold,
                    );
                    const showBadge =
                      state === "preorder" || state === "low-stock";

                    return (
                      <li key={item.id} className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-2.5">
                          <span
                            className={`flex items-baseline gap-1.5 font-nunito text-base font-extrabold ${
                              item.is_available
                                ? "text-[#1F1A17]"
                                : "text-[#7A6F68] line-through decoration-2"
                            }`}
                          >
                            {item.name}
                            {item.is_chef_recommended && (
                              <span className="inline-flex shrink-0 translate-y-[-1px] items-center gap-1 rounded-full bg-[#E3A73B]/15 px-1.5 py-0.5 font-nunito text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#C1442D]">
                                <ChefHat size={11} aria-hidden="true" />
                                Chef&apos;s Pick
                              </span>
                            )}
                          </span>

                          {/* Dotted leader line — the classic printed-menu
                              device connecting a dish to its price. */}
                          <span
                            aria-hidden="true"
                            className={`mb-1 h-0 flex-1 border-b-2 border-dotted ${
                              item.is_available
                                ? "border-[#1F1A17]/20"
                                : "border-[#1F1A17]/10"
                            }`}
                          />

                          {item.is_available ? (
                            <span className="shrink-0 font-nunito text-base font-extrabold text-[#C1442D]">
                              {formatRM(item.price_per_box)}
                            </span>
                          ) : (
                            <StockBadge
                              state={state}
                              stockBoxes={item.stock_boxes}
                              preorderMinimumBoxes={
                                settings.preorder_minimum_boxes
                              }
                            />
                          )}
                        </div>

                        {showBadge && (
                          <StockBadge
                            state={state}
                            stockBoxes={item.stock_boxes}
                            preorderMinimumBoxes={
                              settings.preorder_minimum_boxes
                            }
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <p className="text-sm text-[#1F1A17]/50">
            All boxes contain 10 pcs · Prices in Ringgit Malaysia (RM)
          </p>
        </div>
      </div>
    </section>
  );
}
