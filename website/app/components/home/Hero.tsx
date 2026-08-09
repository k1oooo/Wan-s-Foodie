import Image from "next/image";
import { ArrowRight, Flame, Snowflake, UtensilsCrossed } from "lucide-react";
import Button from "@/app/ui/Button";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#FBF7F2] px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-16">
        {/* Copy */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#C1442D]/20 bg-white px-4 py-1.5 font-nunito text-xs font-extrabold uppercase tracking-[0.15em] text-[#C1442D] sm:text-sm">
            <Flame size={14} /> Homemade &amp; Fresh
          </span>

          <h1 className="mt-6 font-nunito text-5xl font-extrabold leading-[1.05] tracking-[-0.05em] text-[#1F1A17] sm:text-6xl lg:text-7xl">
            Curry Puffs,
            <br />
            Made With <span className="text-[#C1442D]">Love</span>
          </h1>

          <p className="mt-6 max-w-[480px] text-base text-[#1F1A17]/80 sm:text-lg">
            Hand-folded in small batches and frozen fresh, straight from
            Wan&apos;s home kitchen to your freezer — ready whenever you are.
          </p>

          <div className="mt-8 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
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

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-extrabold text-[#1F1A17]/70 sm:justify-start">
            <span className="flex items-center gap-2">
              <UtensilsCrossed size={16} className="text-[#E3A73B]" /> 12
              flavours
            </span>
            <span className="flex items-center gap-2">
              <Snowflake size={16} className="text-[#E3A73B]" /> Frozen fresh
            </span>
            <span className="flex items-center gap-2">
              <Flame size={16} className="text-[#E3A73B]" /> 10 pcs a box
            </span>
          </div>
        </div>

        {/* Image */}
        <div className="relative mx-auto aspect-square w-full max-w-[420px] lg:mx-0 lg:ml-auto">
          <div
            aria-hidden="true"
            className="absolute inset-6 rounded-full bg-[#E3A73B]"
          />
          <div className="absolute inset-0 overflow-hidden rounded-[48px]">
            <Image
              src="/images/karipap.png"
              alt="Freshly fried Wan's Foodies curry puffs"
              fill
              priority
              sizes="(min-width: 1024px) 420px, 80vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-2xl border-2 border-[#1F1A17]/10 bg-white px-5 py-3 text-center shadow-lg sm:-bottom-6 sm:left-auto sm:right-0 sm:translate-x-0">
            <p className="font-nunito text-2xl font-extrabold text-[#C1442D]">
              RM13+
            </p>
            <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#7A6F68]">
              per box of 10
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
