import { MenuIcon, ShoppingCartIcon, User2Icon } from "lucide-react";
import Link from "next/link";

import ModeToggle from "../common/ModeToggle";
import SearchButton from "../common/SearchButton";
import { Button } from "../ui/button";

const Navbar = () => {
  return (
    <nav className="bg-muted flex h-[69px] items-center justify-between border-b px-4 py-3 sm:px-8">
      <div className="md:hidden">
        <MenuIcon size={28} />
      </div>
      <div className="flex w-1/3 items-center justify-start gap-8 text-sm font-medium max-md:hidden">
        <Link
          href={"/deals"}
          className="hover:text-primary underline-offset-8 hover:underline"
        >
          DEALS
        </Link>
        <Link
          href={"/men"}
          className="hover:text-primary underline-offset-8 hover:underline"
        >
          MEN
        </Link>
        <Link
          href={"/women"}
          className="hover:text-primary underline-offset-8 hover:underline"
        >
          WOMEN
        </Link>
        <Link
          href={"/kids"}
          className="hover:text-primary underline-offset-8 hover:underline"
        >
          KIDS
        </Link>
      </div>
      <div className="text-primary font-space-grotesk flex justify-center text-3xl font-extrabold sm:w-1/3 lg:text-4xl">
        <Link href={"/"}>WARDROBE</Link>
      </div>
      <div className="flex w-1/3 items-center justify-end gap-2 sm:gap-8">
        <SearchButton />
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
