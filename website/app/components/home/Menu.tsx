import { menuData } from "@/lib/menu-data";

export default function Menu() {
  return (
    <section
      id="menu"
      className="flex min-h-screen scroll-mt-24 items-center bg-[#FBF7F2] px-6 py-24 sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-[1240px]">
        <h2 className="text-center font-nunito text-4xl font-extrabold tracking-[-0.06em] text-[#1F1A17] sm:text-5xl lg:text-6xl">
          MENU
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8">
          {menuData.map((category) => (
            <div
              key={category.category}
              className="flex flex-col items-center gap-6"
            >
              <h3 className="font-nunito text-3xl font-extrabold tracking-[-0.06em] text-[#1F1A17] sm:text-4xl">
                {category.category}
              </h3>
              <ul className="w-full max-w-[380px] space-y-4">
                {category.items.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-baseline justify-between gap-4 font-nunito text-lg font-extrabold tracking-[-0.03em] text-[#1F1A17] sm:text-xl"
                  >
                    <span>{item.name}</span>
                    <span className="whitespace-nowrap text-[#C1442D]">
                      RM{item.price}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-[480px] text-center text-sm text-[#1F1A17]/70 sm:text-base">
          All boxes come with 10 pcs. Prices in Ringgit Malaysia (RM).
        </p>
      </div>
    </section>
  );
}
