import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navigation/Navbar";

const ShopLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-primary text-primary-foreground group flex h-10 w-full cursor-pointer items-center justify-center gap-2 transition-all duration-300 ease-in-out">
        <Link
          href={"/deals"}
          className="text-sm font-medium underline-offset-8 group-hover:underline"
        >
          Free Shipping Over $49 *
        </Link>
        <ArrowRightIcon className="size-4 transition-transform group-hover:scale-120" />
      </div>

      <Navbar />

      <main className="container mx-auto flex-1">{children}</main>

      <Footer />
    </div>
  );
};
export default ShopLayout;
