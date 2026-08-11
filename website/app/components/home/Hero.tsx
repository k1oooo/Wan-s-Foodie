import Image from "next/image";
import { ArrowRight, Flame, Snowflake, UtensilsCrossed } from "lucide-react";
import Button from "@/app/ui/Button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#FBF7F2] px-6 pb-20 pt-28 sm:px-10 lg:px-16 lg:pb-28 lg:pt-32">
      {/* Decorative background shapes */}
      <div
        aria-hidden="true"
        className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#E3A73B]/15"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#C1442D]/5"
      />

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

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 divide-x divide-[#1F1A17]/10 rounded-2xl border border-[#1F1A17]/8 bg-white px-2 py-4 shadow-sm">
            <div className="px-4 text-center sm:px-6">
              <UtensilsCrossed
                size={17}
                className="mx-auto mb-1 text-[#E3A73B]"
              />
              <p className="font-nunito text-sm font-extrabold text-[#1F1A17]">
                12
              </p>
              <p className="text-[11px] text-[#7A6F68]">Flavours</p>
            </div>

            <div className="px-4 text-center sm:px-6">
              <Snowflake size={17} className="mx-auto mb-1 text-[#E3A73B]" />
              <p className="font-nunito text-sm font-extrabold text-[#1F1A17]">
                Fresh
              </p>
              <p className="text-[11px] text-[#7A6F68]">Frozen</p>
            </div>

            <div className="px-4 text-center sm:px-6">
              <Flame size={17} className="mx-auto mb-1 text-[#E3A73B]" />
              <p className="font-nunito text-sm font-extrabold text-[#1F1A17]">
                10 pcs
              </p>
              <p className="text-[11px] text-[#7A6F68]">Per box</p>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="relative mx-auto w-full max-w-[500px]">
          <div
            aria-hidden="true"
            className="absolute inset-8 rounded-full bg-[#E3A73B]/25"
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

          {/* Price badge */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-2xl border border-[#1F1A17]/8 bg-white px-6 py-3 text-center shadow-xl sm:left-auto sm:right-0 sm:translate-x-0">
            <p className="font-nunito text-2xl font-extrabold text-[#C1442D]">
              RM13+
            </p>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#7A6F68]">
              Box of 10
            </p>
          </div>

          {/* Small decorative badge */}
          <div className="absolute -left-4 top-10 hidden rounded-full bg-[#C1442D] px-4 py-2 font-nunito text-xs font-extrabold text-white shadow-lg sm:block">
            Handmade
          </div>
        </div>
      </div>
    </section>
  );
}
