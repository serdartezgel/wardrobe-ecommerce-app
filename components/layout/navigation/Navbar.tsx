import { ShoppingCartIcon, User2Icon } from "lucide-react";
import Link from "next/link";

import MobileNav from "./MobileNav";
import Navigation from "./Navigation";
import GlobalSearchModal from "../../common/GlobalSearchModal";
import ModeToggle from "../../common/ModeToggle";
import { Button } from "../../ui/button";

const Navbar = () => {
  return (
    <nav className="bg-muted flex h-[69px] items-center justify-between border-b px-4 py-3 lg:px-8">
      <div className="w-1/3">
        <MobileNav />
        <Navigation />
      </div>
      <div className="text-primary font-space-grotesk flex justify-center text-3xl font-extrabold md:w-1/3 lg:text-4xl">
        <Link href={"/"}>WARDROBE</Link>
      </div>
      <div className="flex w-1/3 items-center justify-end md:gap-8">
        <GlobalSearchModal />
        <ModeToggle />
        <Button variant={"ghost"} size={"icon-lg"} className="no-focus" asChild>
          <Link href={"/account"}>
            <User2Icon className="size-5" />
          </Link>
        </Button>
        <Button variant={"ghost"} size={"icon-lg"} className="no-focus" asChild>
          <Link href={"/cart"}>
            <ShoppingCartIcon className="size-5" />
          </Link>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
