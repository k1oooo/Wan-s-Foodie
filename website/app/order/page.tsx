import type { Metadata } from "next";
import Navbar from "@/app/components/layout/Navbar";
import Footer from "@/app/components/layout/Footer";
import OrderPageClient from "@/app/components/order/OrderPageClient";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";

const PAGE_TITLE = `Order Now | ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  "Order Wan's Foodies frozen curry puffs online. Choose your flavours, pick pickup or delivery, and check out instantly via WhatsApp.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/order`,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/order`,
    siteName: SITE_NAME,
    type: "website",
  },
};

export default function OrderPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FBF7F2]">
        <OrderPageClient />
      </main>
      <Footer />
    </>
  );
}
