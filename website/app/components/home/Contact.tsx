import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { buildWhatsAppLink, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/site-config";

interface ContactProps {
  /** From live site settings (Admin > Settings), falls back to the
   * default number if settings couldn't be loaded. */
  whatsappNumber?: string;
}

export default function Contact({ whatsappNumber }: ContactProps) {
  return (
    <section
      id="contact"
      className="scroll-mt-24 bg-[#FBF7F2] px-6 pb-24 pt-12 sm:px-10 lg:px-16 lg:pb-32 lg:pt-20"
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="relative overflow-hidden rounded-[36px] bg-[#C1442D] px-6 py-16 text-center sm:px-12 lg:px-20 lg:py-20">
          {/* Decorative shapes */}
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[40px] border-white/10"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#E3A73B]/20"
          />

          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-nunito text-xs font-extrabold uppercase tracking-[0.16em] text-white">
              <MessageCircle size={14} />
              Let&apos;s Talk
            </span>

            <h2 className="mt-5 font-nunito text-4xl font-extrabold tracking-[-0.06em] text-[#FBF7F2] sm:text-5xl lg:text-6xl">
              Craving some curry puffs?
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
              Questions about flavours, bulk orders, or Raya pre-orders?
              We&apos;re just a WhatsApp message away.
            </p>

            <Link
              href={buildWhatsAppLink(WHATSAPP_DEFAULT_MESSAGE, whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#FBF7F2] px-7 py-4 font-nunito text-base font-extrabold text-[#C1442D] shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
            >
              Chat on WhatsApp
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
