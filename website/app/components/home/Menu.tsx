import { getPublicMenu } from "@/lib/menu";
import { formatRM } from "@/lib/order-utils";

export default async function Menu() {
  const menu = await getPublicMenu();

  return (
    <section
      id="menu"
      className="scroll-mt-24 bg-[#FBF7F2] px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
    >
      <div className="mx-auto w-full max-w-[1240px]">
        {/* Heading */}
        <div className="text-center">
          <span className="font-nunito text-sm font-extrabold uppercase tracking-[0.18em] text-[#C1442D]">
            What&apos;s Cooking
          </span>

          <h2 className="mt-3 font-nunito text-4xl font-extrabold tracking-[-0.06em] text-[#1F1A17] sm:text-5xl lg:text-6xl">
            Our Menu
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base leading-6 text-[#1F1A17]/60">
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
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {menu.map((group) => (
              <div
                key={group.category}
                className="rounded-[28px] border border-[#1F1A17]/8 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-[#E3A73B]" />

                  <h3 className="font-nunito text-2xl font-extrabold tracking-[-0.04em] text-[#1F1A17]">
                    {group.label}
                  </h3>
                </div>

                <div className="mt-5 divide-y divide-[#1F1A17]/8">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <div className={item.is_available ? "" : "opacity-40"}>
                        <p className="font-nunito text-base font-extrabold text-[#1F1A17]">
                          {item.name}
                        </p>

                        {!item.is_available && (
                          <p className="mt-0.5 text-xs text-[#7A6F68]">
                            Sold out
                          </p>
                        )}
                      </div>

                      <span
                        className={`shrink-0 font-nunito text-base font-extrabold ${
                          item.is_available
                            ? "text-[#C1442D]"
                            : "text-[#7A6F68]/50"
                        }`}
                      >
                        {formatRM(item.price_per_box)}
                      </span>
                    </div>
                  ))}
                </div>
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
