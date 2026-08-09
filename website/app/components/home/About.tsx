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
      className="relative flex min-h-screen scroll-mt-24 items-center bg-[#E3A73B] px-6 py-24 sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="flex justify-center">
          <h2 className="inline-flex items-center rounded-[40px] bg-white px-6 py-2.5 text-center font-nunito text-3xl font-extrabold tracking-[-0.06em] sm:text-4xl lg:text-5xl">
            <span className="text-[#1F1A17]">About&nbsp;</span>
            <span className="text-[#C1442D]">Wan&apos;s Foodies</span>
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 items-center gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-16">
          {/* Photo, framed with a dashed accent matching the receipt/hawker motif */}
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px] lg:max-w-none">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-[44px] border-2 border-dashed border-white/60"
            />
            <div className="relative h-full w-full overflow-hidden rounded-[40px] bg-[#FBF7F2]">
              <Image
                src="/images/about-photo.jpg"
                alt="Wan hand-folding curry puffs in her home kitchen"
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Story + value props */}
          <div>
            <p className="text-justify font-nunito text-lg font-extrabold leading-[1.5] tracking-[-0.02em] text-[#1F1A17] sm:text-xl">
              What started as curry puffs for the neighbourhood has grown into
              Wan&apos;s Foodies — a home kitchen making frozen curry puffs the
              way they&apos;ve always been made: hand-folded, fried fresh, and
              packed with real ingredients.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {VALUES.map((value) => (
                <div
                  key={value.title}
                  className="flex items-start gap-3 rounded-2xl bg-white/40 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#C1442D]">
                    <value.icon size={20} />
                  </div>
                  <div>
                    <p className="font-nunito text-base font-extrabold text-[#1F1A17]">
                      {value.title}
                    </p>
                    <p className="text-sm text-[#1F1A17]/70">
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
