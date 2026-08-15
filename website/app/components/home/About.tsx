import Image from "next/image";
import { ChefHat, Package, Sparkles } from "lucide-react";

const VALUES = [
  { icon: ChefHat, label: "Hand-folded" },
  { icon: Package, label: "Small batches" },
  { icon: Sparkles, label: "Real ingredients" },
];

export default function About() {
  return (
    <section
      id="about"
      className="scroll-mt-24 bg-[#FBF7F2] px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
    >
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Image — same dashed-ring "stamped paper" frame used in the
              hero, so the two sections read as one visual system. */}
          <div className="relative mx-auto w-full max-w-[480px] lg:mx-0">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-[44px] border-2 border-dashed border-[#E3A73B]"
            />

            <div className="relative aspect-[4/5] overflow-hidden rounded-[38px] border-8 border-white bg-white shadow-[0_20px_50px_rgba(31,26,23,0.10)]">
              <Image
                src="/images/about-photo.jpg"
                alt="Wan hand-folding curry puffs in her home kitchen"
                fill
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover"
              />
            </div>

            <div className="absolute -bottom-6 -right-4 rotate-2 rounded-2xl bg-[#E3A73B] px-5 py-4 shadow-lg">
              <p className="font-nunito text-sm font-extrabold text-[#1F1A17]">
                From our kitchen
              </p>
              <p className="text-xs text-[#1F1A17]/70">to your freezer.</p>
            </div>
          </div>

          {/* Story — kept to one short paragraph on purpose. */}
          <div className="text-center lg:text-left">
            <span className="font-nunito text-sm font-extrabold uppercase tracking-[0.18em] text-[#C1442D]">
              Our Story
            </span>

            <h2 className="mt-3 font-nunito text-4xl font-extrabold tracking-[-0.06em] text-[#1F1A17] sm:text-5xl lg:text-6xl">
              Made the way it&apos;s
              <span className="text-[#C1442D]"> always been.</span>
            </h2>

            <p className="mx-auto mt-6 max-w-[480px] text-base leading-7 text-[#1F1A17]/65 lg:mx-0">
              What started as curry puffs for the neighbourhood is now
              Wan&apos;s Foodies — still hand-folded, still fried fresh, one
              small batch at a time.
            </p>

            {/* Values — compact pills instead of a stacked card list, so
                the section stays light and doesn't repeat what the
                paragraph already says. */}
            <div className="mt-7 flex flex-wrap justify-center gap-2.5 lg:justify-start">
              {VALUES.map((value) => (
                <span
                  key={value.label}
                  className="inline-flex items-center gap-2 rounded-full border border-[#1F1A17]/8 bg-white px-4 py-2 font-nunito text-sm font-extrabold text-[#1F1A17] shadow-sm"
                >
                  <value.icon size={16} className="text-[#C1442D]" />
                  {value.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
