"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

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
import { Input } from "../ui/input";

const GlobarSearch = () => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Drawer direction="top">
      <DrawerTrigger asChild>
        <Button variant={"ghost"} size={"icon-lg"} className="no-focus">
          <SearchIcon className="size-5 max-md:hidden" />
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
          <div className="relative flex items-center">
            <Input
              ref={inputRef}
              type="text"
              className="no-focus border-foreground h-12 w-3xl border-3"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            <p
              className={cn(
                "text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2 cursor-text transition-all duration-200 ease-in-out",
                focused || inputRef.current?.value
                  ? "top-2 text-xs"
                  : "top-1/2 text-base",
              )}
              onClick={() => inputRef.current?.focus()}
            >
              Search
            </p>
            <SearchIcon className="absolute right-4 size-6 cursor-pointer" />
          </div>
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

export default GlobarSearch;
