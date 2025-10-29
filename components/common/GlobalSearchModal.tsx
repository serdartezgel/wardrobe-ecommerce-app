"use client";

import { SearchIcon, XIcon } from "lucide-react";

import GlobalSearchInput from "./GlobalSearchInput";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";

const GlobarSearchModal = () => {
  return (
    <Drawer direction="top">
      <DrawerTrigger asChild>
        <Button
          variant={"ghost"}
          size={"icon-lg"}
          className="no-focus cursor-pointer max-md:hidden"
        >
          <SearchIcon className="size-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="sr-only">Search</DrawerTitle>
          <DrawerDescription className="sr-only">
            Search products
          </DrawerDescription>
        </DrawerHeader>
        <div className="mb-8 flex h-24 items-center justify-center gap-2">
          <GlobalSearchInput />
          <DrawerClose asChild>
            <Button variant="link" className="group">
              <XIcon className="text-foreground size-8 transition-transform group-hover:scale-110" />
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default GlobarSearchModal;
