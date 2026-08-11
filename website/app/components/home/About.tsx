import Image from "next/image";
import { ChefHat, Package, Sparkles } from "lucide-react";

const VALUES = [
  {
    icon: ChefHat,
    title: "Hand-Folded",
    description: "Every curry puff is pleated by hand, the traditional way.",
  },
  {
    icon: Package,
    title: "Small Batches",
    description: "Made fresh in small batches, never mass-produced.",
  },
  {
    icon: Sparkles,
    title: "Real Ingredients",
    description: "No shortcuts — just honest, home-kitchen ingredients.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="scroll-mt-24 bg-[#FBF7F2] px-6 py-24 sm:px-10 lg:px-16 lg:py-32"
    >
      <div className="mx-auto w-full max-w-[1240px]">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-nunito text-sm font-extrabold uppercase tracking-[0.18em] text-[#C1442D]">
            Our Story
          </span>

          <h2 className="mt-3  text-4xl font-extrabold tracking-[-0.06em] text-[#1F1A17] sm:text-5xl lg:text-6xl">
            Made the way it&apos;s
            <span className="text-[#C1442D]"> always been.</span>
          </h2>
        </div>

        {/* Main content */}
        <div className="mt-16 grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Image */}
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

            <div className="absolute -bottom-6 -right-4 rounded-2xl bg-[#E3A73B] px-5 py-4 shadow-lg">
              <p className="font-nunito text-sm font-extrabold text-[#1F1A17]">
                From our kitchen
              </p>
              <p className="text-xs text-[#1F1A17]/70">to your freezer.</p>
            </div>
          </div>

          {/* Story */}
          <div>
            <p className="font-nunito text-xl font-extrabold leading-[1.55] tracking-[-0.025em] text-[#1F1A17] sm:text-2xl">
              What started as curry puffs for the neighbourhood has grown into
              Wan&apos;s Foodies — a home kitchen making frozen curry puffs the
              way they&apos;ve always been made.
            </p>

            <p className="mt-5 text-base leading-7 text-[#1F1A17]/65">
              Hand-folded, fried fresh, and packed with real ingredients. Every
              box is prepared with the same care we&apos;d give to food served
              at our own table.
            </p>

            {/* Values */}
            <div className="mt-9 space-y-3">
              {VALUES.map((value) => (
                <div
                  key={value.title}
                  className="flex items-start gap-4 rounded-2xl border border-[#1F1A17]/8 bg-white p-4 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E3A73B]/20 text-[#C1442D]">
                    <value.icon size={20} />
                  </div>

                  <div>
                    <p className="font-nunito text-base font-extrabold text-[#1F1A17]">
                      {value.title}
                    </p>

                    <p className="mt-0.5 text-sm leading-5 text-[#1F1A17]/60">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
