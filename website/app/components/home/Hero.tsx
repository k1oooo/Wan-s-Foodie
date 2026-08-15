import Image from "next/image";
import { ArrowRight, Flame, Snowflake } from "lucide-react";
import Button from "@/app/ui/Button";
import { getPublicMenu } from "@/lib/menu";
import { formatRM } from "@/lib/order-utils";

export default async function Hero() {
  const menu = await getPublicMenu();
  const items = menu.flatMap((group) => group.items);
  const flavourCount = items.length;
  const startingPrice = items.length
    ? Math.min(...items.map((item) => item.price_per_box))
    : null;

  return (
    <section className="relative overflow-hidden bg-[#FBF7F2] px-6 pb-20 pt-28 sm:px-10 lg:px-16 lg:pb-28 lg:pt-32">
      <div className="relative mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        {/* Copy */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#C1442D]/20 bg-white px-4 py-2 font-nunito text-xs font-extrabold uppercase tracking-[0.14em] text-[#C1442D] shadow-sm sm:text-sm">
            <Flame size={14} />
            Homemade & Fresh
          </span>

          <h1 className="mt-7 max-w-[700px] font-nunito text-5xl font-extrabold leading-[0.98] tracking-[-0.065em] text-[#1F1A17] sm:text-6xl lg:text-[76px]">
            Curry Puffs,
            <br />
            <span className="text-[#C1442D]">Made With Love.</span>
          </h1>

          <p className="mt-7 max-w-[530px] text-base leading-7 text-[#1F1A17]/70 sm:text-lg">
            Hand-folded in small batches and frozen fresh, straight from
            Wan&apos;s home kitchen to your freezer — ready whenever you are.
          </p>

          <div className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Button href="/order" className="group w-full sm:w-auto">
              Order Now
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Button>

            <Button
              href="/#menu"
              variant="outline"
              className="w-full sm:w-auto"
            >
              View Menu
            </Button>
          </div>

          {/* Stats — pulled from the live menu rather than hardcoded, so
              this never drifts out of sync with what's actually for sale. */}
          <div className="mt-10 grid grid-cols-2 divide-x divide-[#1F1A17]/10 rounded-2xl border border-[#1F1A17]/8 bg-white px-2 py-4 shadow-sm">
            <div className="px-4 text-center sm:px-8">
              <p className="font-nunito text-2xl font-extrabold text-[#C1442D]">
                {flavourCount || "12"}
              </p>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#7A6F68]">
                Flavours
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 px-4 text-center sm:px-8">
              <Snowflake size={16} className="text-[#E3A73B]" />
              <div className="text-left">
                <p className="font-nunito text-sm font-extrabold text-[#1F1A17]">
                  Frozen fresh
                </p>
                <p className="text-[11px] text-[#7A6F68]">10 pcs a box</p>
              </div>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="relative mx-auto w-full max-w-[500px]">
          {/* Stamped ring — a wider, quieter echo of the menu ticket's
              perforated edge, standing in for the generic soft blob this
              section used to lean on. */}
          <div
            aria-hidden="true"
            className="absolute inset-2 rounded-full border-[3px] border-dashed border-[#E3A73B]/40"
          />

          <div className="relative aspect-square overflow-hidden rounded-[48px] border-[10px] border-white shadow-[0_20px_60px_rgba(31,26,23,0.12)]">
            <Image
              src="/images/karipap.png"
              alt="Freshly fried Wan's Foodies curry puffs"
              fill
              priority
              sizes="(min-width: 1024px) 500px, 90vw"
              className="object-cover"
            />
          </div>

          {/* Price tag — styled like a hand-written hawker-stall price
              string-tag rather than a generic floating card: a slight
              tilt and a punched hole where the string would loop through. */}
          {startingPrice !== null && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 -rotate-3 rounded-2xl border-2 border-[#C1442D]/15 bg-white px-6 py-3 pl-8 text-center shadow-xl sm:left-auto sm:right-0 sm:translate-x-0">
              <span
                aria-hidden="true"
                className="absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border border-[#1F1A17]/15 bg-[#FBF7F2]"
              />
              <p className="font-nunito text-2xl font-extrabold text-[#C1442D]">
                From {formatRM(startingPrice)}
              </p>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#7A6F68]">
                Box of 10
              </p>
            </div>
          )}

          {/* Small decorative badge */}
          <div className="absolute -left-4 top-10 hidden rotate-2 rounded-full bg-[#C1442D] px-4 py-2 font-nunito text-xs font-extrabold text-white shadow-lg sm:block">
            Handmade
          </div>
        </div>
      </div>
    </section>
  );
}
