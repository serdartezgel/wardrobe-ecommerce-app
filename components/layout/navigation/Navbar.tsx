import { ShoppingCartIcon, User2Icon } from "lucide-react";
import Link from "next/link";

import MobileNav from "./MobileNav";
import Navigation from "./Navigation";
import GlobalSearch from "../../common/GlobalSearch";
import ModeToggle from "../../common/ModeToggle";
import { Button } from "../../ui/button";

const Navbar = () => {
  return (
    <nav className="bg-muted flex h-[69px] items-center justify-between border-b px-4 py-3 lg:px-8">
      <MobileNav />
      <Navigation />
      <div className="text-primary font-space-grotesk flex justify-center text-3xl font-extrabold md:w-1/3 lg:text-4xl">
        <Link href={"/"}>WARDROBE</Link>
      </div>
      <div className="flex w-1/3 items-center justify-end gap-2 lg:gap-8">
        <GlobalSearch />
        <ModeToggle />
        <Button variant={"ghost"} size={"icon-lg"} className="no-focus">
          <User2Icon className="size-5" />
        </Button>
        <Button variant={"ghost"} size={"icon-lg"} className="no-focus">
          <ShoppingCartIcon className="size-5" />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
