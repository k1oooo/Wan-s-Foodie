import { SITE_NAME } from "@/lib/site-config";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#C1442D] px-6 pb-8 pt-6 sm:px-10">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col items-center gap-3 border-t border-white/40 pt-5 text-sm text-[#FBF7F2] sm:flex-row sm:justify-between sm:text-base">
        <p className="tracking-[-0.02em]">
          © {year} {SITE_NAME}
        </p>
        <Link href="https://kio-portfolio.vercel.app/" target="_blank">
          <p className="tracking-[-0.02em]">
            Site By <span className="font-semibold">&lt;KioWeb/&gt;</span>
          </p>
        </Link>
      </div>
    </footer>
  );
}
