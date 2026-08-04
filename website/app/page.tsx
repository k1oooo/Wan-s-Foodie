import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wan's Foodie | Homemade Frozen Curry Puffs",
  description:
    "Order homemade frozen curry puffs in a variety of flavours, plus crispy fried onion toppings, from Wan's Foodie. Pay easily with DuitNow QR, no sign-up needed.",
  keywords: [
    "curry puffs",
    "frozen food",
    "home food business",
    "Wan's Foodie",
    "DuitNow QR order",
  ],
  openGraph: {
    title: "Wan's Foodie | Homemade Frozen Curry Puffs",
    description:
      "Homemade frozen curry puffs in a variety of flavours, made fresh and delivered to your door.",
    type: "website",
  },
};

const flavours = [
  {
    name: "Chicken curry puff",
    price: "RM 2.50 / pc",
    color: "bg-secondary",
    textColor: "text-[#0C447C]",
  },
  {
    name: "Sardine curry puff",
    price: "RM 2.50 / pc",
    color: "bg-[#F4C0D1]",
    textColor: "text-[#993556]",
  },
  {
    name: "Fried onion topping",
    price: "RM 1.00 / pc",
    color: "bg-[#FAC775]",
    textColor: "text-[#854F0B]",
  },
  {
    name: "Raya biscuits",
    price: "Seasonal",
    color: "bg-[#F0997B]",
    textColor: "text-[#712B13]",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-black/5 bg-base/95 backdrop-blur">
        <nav
          className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"
          aria-label="Main navigation"
        >
          <a href="/" className="font-heading text-lg font-bold text-[#2C2C2A]">
            Wan&apos;s Foodie
          </a>

          {/* Desktop links */}
          <ul className="hidden items-center gap-8 font-body text-sm font-semibold text-[#5F5E5A] md:flex">
            <li>
              <a href="#menu" className="hover:text-[#2C2C2A]">
                Menu
              </a>
            </li>
            <li>
              <a href="#about" className="hover:text-[#2C2C2A]">
                About
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-[#2C2C2A]">
                Contact
              </a>
            </li>
          </ul>

          <a
            href="#menu"
            className="hidden rounded-lg bg-accent px-5 py-2.5 font-heading text-sm font-semibold text-[#4B1528] md:inline-block"
          >
            Order now
          </a>

          {/* Mobile menu toggle (checkbox-only, no JS needed) */}
          <input type="checkbox" id="nav-toggle" className="peer hidden" />
          <label
            htmlFor="nav-toggle"
            className="cursor-pointer text-2xl text-[#2C2C2A] md:hidden"
            aria-label="Toggle menu"
          >
            &#9776;
          </label>
          <div className="absolute left-0 top-full hidden w-full flex-col gap-4 border-b border-black/5 bg-base px-5 py-5 peer-checked:flex md:hidden">
            <a
              href="#menu"
              className="font-body text-sm font-semibold text-[#5F5E5A]"
            >
              Menu
            </a>
            <a
              href="#about"
              className="font-body text-sm font-semibold text-[#5F5E5A]"
            >
              About
            </a>
            <a
              href="#contact"
              className="font-body text-sm font-semibold text-[#5F5E5A]"
            >
              Contact
            </a>
            <a
              href="#menu"
              className="w-fit rounded-lg bg-accent px-5 py-2.5 font-heading text-sm font-semibold text-[#4B1528]"
            >
              Order now
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-secondary px-5 py-16 text-center sm:py-20">
          <p className="font-body text-xs font-semibold tracking-wide text-[#0C447C] sm:text-sm">
            HOMEMADE &middot; FROZEN &middot; FRESH
          </p>
          <h1 className="mx-auto mt-3 max-w-2xl font-heading text-3xl font-bold leading-tight text-[#042C53] sm:text-4xl md:text-5xl">
            Curry puffs made with love, ready when you are
          </h1>
          <p className="mx-auto mt-4 max-w-md font-body text-sm text-[#0C447C] sm:text-base">
            A variety of flavours, plus crispy fried onion toppings. Order
            straight to your door.
          </p>
          <a
            href="#menu"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-7 py-3.5 font-heading text-sm font-semibold text-[#4B1528] sm:text-base"
          >
            Browse the menu
          </a>
        </section>

        {/* Menu highlights */}
        <section id="menu" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-heading text-xl font-semibold text-[#2C2C2A] sm:text-2xl">
              Popular flavours
            </h2>
            <a href="#menu" className="font-body text-sm text-[#5F5E5A]">
              See all
            </a>
          </div>

          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {flavours.map((item) => (
              <li
                key={item.name}
                className="overflow-hidden rounded-xl border border-black/5 bg-white"
              >
                <div
                  className={`flex h-28 items-center justify-center sm:h-36 ${item.color}`}
                  aria-hidden="true"
                >
                  <span
                    className={`font-heading text-sm font-semibold ${item.textColor}`}
                  >
                    photo
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-heading text-sm font-semibold text-[#2C2C2A]">
                    {item.name}
                  </p>
                  <p className="mt-1 font-body text-xs text-[#5F5E5A]">
                    {item.price}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* About / mission */}
        <section id="about" className="bg-white px-5 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="font-heading text-xl font-semibold text-[#2C2C2A] sm:text-2xl">
                Made fresh, straight from home
              </h2>
              <p className="mt-4 font-body text-sm leading-relaxed text-[#5F5E5A] sm:text-base">
                Wan&apos;s Foodie started as a small home kitchen selling frozen
                curry puffs in a range of flavours, finished with crispy fried
                onion toppings. Every order is prepared fresh before it&apos;s
                frozen and sent your way.
              </p>
            </div>
            <div className="flex h-48 items-center justify-center rounded-xl bg-secondary sm:h-64">
              <span className="font-heading text-sm font-semibold text-[#0C447C]">
                photo placeholder
              </span>
            </div>
          </div>
        </section>

        {/* Payment / ordering info */}
        <section className="mx-auto max-w-6xl px-5 pb-16 sm:pb-20">
          <div className="flex flex-col items-start gap-4 rounded-xl border border-black/5 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-heading text-sm font-semibold text-[#2C2C2A]">
                Pay with DuitNow QR
              </p>
              <p className="mt-1 font-body text-xs text-[#5F5E5A] sm:text-sm">
                No sign-up needed &mdash; place your order and pay by DuitNow QR
                or bank transfer.
              </p>
            </div>
            <a
              href="#menu"
              className="rounded-lg bg-accent px-5 py-2.5 font-heading text-sm font-semibold text-[#4B1528]"
            >
              Start an order
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        id="contact"
        className="border-t border-black/5 bg-base px-5 py-12"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <p className="font-heading text-base font-bold text-[#2C2C2A]">
              Wan&apos;s Foodie
            </p>
            <p className="mt-2 max-w-xs font-body text-sm text-[#5F5E5A]">
              Homemade frozen curry puffs, made fresh with love.
            </p>
          </div>
          <div className="font-body text-sm text-[#5F5E5A]">
            <p className="font-heading text-sm font-semibold text-[#2C2C2A]">
              Contact
            </p>
            <p className="mt-2">Business owner: 012-361 9697</p>
            <p>Website admin: 011-5404 3689</p>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-6xl font-body text-xs text-[#5F5E5A]">
          &copy; {new Date().getFullYear()} Wan&apos;s Foodie. All rights
          reserved.
        </p>
      </footer>
    </>
  );
}
