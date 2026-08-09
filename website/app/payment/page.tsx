import type { Metadata } from "next";
import Navbar from "@/app/components/layout/Navbar";
import PaymentPageClient from "@/app/components/payment/PaymentPageClient.";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";

const PAGE_TITLE = `Order Information | ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  "Review your Wan's Foodies curry puff order, fill in your details, and send your order via WhatsApp.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  robots: {
    index: false, // checkout page — no need to be indexed
  },
  alternates: {
    canonical: `${SITE_URL}/payment`,
  },
};

export default function PaymentPage() {
  return (
    // No footer here on purpose — on large screens this page is height-locked
    // to the viewport (see PaymentPageClient) so the Send Order button never
    // requires scrolling. The footer would push past the fold.
    <div className="flex flex-col bg-[#FBF7F2] lg:h-screen lg:overflow-hidden">
      <Navbar />
      <main className="flex-1 lg:min-h-0">
        <PaymentPageClient />
      </main>
    </div>
  );
}
