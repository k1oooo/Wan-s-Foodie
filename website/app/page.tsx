import type { Metadata } from "next";
import Navbar from "@/app/components/layout/Navbar";
import Footer from "@/app/components/layout/Footer";
import Hero from "@/app/components/home/Hero";
import About from "@/app/components/home/About";
import Menu from "@/app/components/home/Menu";
import Contact from "@/app/components/home/Contact";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `${SITE_NAME} | Homemade Frozen Curry Puffs`,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${SITE_NAME} | Homemade Frozen Curry Puffs`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/images/hero-curry-puff.png",
        width: 800,
        height: 800,
        alt: "Wan's Foodies curry puffs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Homemade Frozen Curry Puffs`,
    description: SITE_DESCRIPTION,
  },
};

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* Each section below is min-h-screen and self-contained (own
            background + scallop dividers), so scrolling through the page
            reads as one full-viewport "slide" per section. */}
        <Hero />
        <About />
        <Menu />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
