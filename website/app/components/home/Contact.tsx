import Link from "next/link";

import { buildWhatsAppLink } from "@/lib/site-config";

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative flex min-h-screen scroll-mt-24 items-center justify-center overflow-hidden bg-[#C1442D] px-6 py-20 sm:px-10 lg:py-28"
    >
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center text-center">
        <h2 className="font-nunito text-4xl font-extrabold tracking-[-0.06em] text-[#FBF7F2] sm:text-5xl">
          GET IN TOUCH
        </h2>
        <p className="mt-4 font-nunito text-lg font-extrabold leading-[1.4] tracking-[-0.03em] text-[#FBF7F2] sm:text-2xl">
          Questions about flavours, bulk orders, or Raya pre-orders? Reach out
          on WhatsApp.
        </p>
        <Link
          href={buildWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 rounded-full border-2 border-[#E3A73B] bg-[#FBF7F2] px-8 py-4 font-nunito text-lg font-extrabold text-[#C1442D] transition-opacity hover:opacity-90"
        >
          Chat on WhatsApp
        </Link>
      </div>
    </section>
  );
}
