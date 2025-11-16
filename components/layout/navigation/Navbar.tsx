import { ArrowRightIcon, ShoppingCartIcon, User2Icon } from "lucide-react";
import Link from "next/link";

import { getAllCategories } from "@/lib/actions/category.action";

import MobileNav from "./MobileNav";
import Navigation from "./Navigation";
import GlobalSearchModal from "../../common/GlobalSearchModal";
import ModeToggle from "../../common/ModeToggle";
import { Button } from "../../ui/button";

const Navbar = async () => {
  const result = await getAllCategories(false);

  return (
    <>
      <div className="bg-primary text-primary-foreground group flex w-full cursor-pointer items-center justify-center gap-2 py-2 transition-all duration-300 ease-in-out">
        <Link
          href={"/deals"}
          className="text-sm font-medium underline-offset-8 group-hover:underline"
        >
          Free Shipping Over $49 *
        </Link>
        <ArrowRightIcon className="size-4 transition-transform group-hover:scale-120" />
      </div>
      <nav className="bg-muted sticky flex h-[69px] w-full items-center justify-between border-b px-4 py-6 lg:px-8">
        <div className="w-1/3">
          <MobileNav categories={result.data || []} deals={[]} />
          <Navigation categories={result.data || []} deals={[]} />
        </div>
        <div className="text-primary font-space-grotesk flex justify-center text-3xl font-extrabold md:w-1/3 lg:text-4xl">
          <Link href={"/"}>WARDROBE</Link>
        </div>
        <div className="flex w-1/3 items-center justify-end md:gap-8">
          <GlobalSearchModal />
          <ModeToggle />
          <Button
            variant={"ghost"}
            size={"icon-lg"}
            className="no-focus"
            asChild
          >
            <Link href={"/account"}>
              <User2Icon className="size-5" />
            </Link>
          </Button>
          <Button
            variant={"ghost"}
            size={"icon-lg"}
            className="no-focus"
            asChild
          >
            <Link href={"/cart"}>
              <ShoppingCartIcon className="size-5" />
            </Link>
          </Button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
