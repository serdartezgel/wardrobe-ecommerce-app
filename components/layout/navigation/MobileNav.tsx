"use client";

import { ArrowRightIcon, MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { navLinks } from "@/lib/constants/navLinks";

const MobileNav = () => {
  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <Button
          variant={"ghost"}
          size={"icon-lg"}
          className="no-focus md:hidden"
        >
          <MenuIcon className="size-7" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="flex flex-row items-center justify-between border-b">
          <DrawerTitle className="text-primary font-space-grotesk text-3xl font-extrabold">
            <Link href={"/"}>WARDROBE</Link>
          </DrawerTitle>
          <DrawerDescription className="sr-only"></DrawerDescription>
          <DrawerClose className="group">
            <XIcon className="text-foreground size-8 transition-transform group-hover:scale-110" />
          </DrawerClose>
        </DrawerHeader>
        <Accordion
          type="single"
          collapsible
          className="w-full px-4"
          defaultValue="deals"
        >
          {navLinks.map((section) => (
            <AccordionItem
              key={section.label.toLowerCase()}
              value={section.label.toLowerCase()}
            >
              <AccordionTrigger className="font-space-grotesk hover:text-primary text-base underline-offset-8">
                {section.label.toUpperCase()}
              </AccordionTrigger>

              <AccordionContent className="flex flex-col gap-4 px-4">
                {section.children!.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="hover:text-primary flex items-center justify-between underline-offset-8 hover:underline"
                  >
                    {child.label}
                    <ArrowRightIcon className="size-4" />
                  </Link>
                ))}

                <Link
                  href={section.href}
                  className="hover:text-primary flex items-center justify-between underline-offset-8 hover:underline"
                >
                  View All
                  <ArrowRightIcon className="size-4" />
                </Link>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </DrawerContent>
    </Drawer>
  );
};
export default MobileNav;
