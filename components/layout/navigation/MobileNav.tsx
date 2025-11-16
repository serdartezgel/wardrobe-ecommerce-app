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
import { dealIcon } from "@/lib/constants/dealIcons";
import { Promotion } from "@/lib/generated/prisma";
import { CategoryWithChildren } from "@/types/prisma";

const MobileNav = ({
  categories,
  deals,
}: {
  categories: CategoryWithChildren[];
  deals: Promotion[];
}) => {
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
          <AccordionItem value="deals">
            <AccordionTrigger className="font-space-grotesk hover:text-primary text-base uppercase underline-offset-8">
              DEALS
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 px-4">
              {deals.map((deal) => {
                const Icon = dealIcon[deal.type];
                return (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.id}`}
                    className="hover:text-primary flex items-center justify-between underline-offset-8 hover:underline"
                  >
                    <div className="flex items-center gap-2 capitalize">
                      <Icon className="text-primary" />
                      {deal.name}
                    </div>
                    <ArrowRightIcon className="size-5" />
                  </Link>
                );
              })}
              <Link
                href={`/deals`}
                className="hover:text-primary flex items-center justify-between pl-2 capitalize underline-offset-8 hover:underline"
              >
                View All
                <ArrowRightIcon className="size-5" />
              </Link>
            </AccordionContent>
          </AccordionItem>
          {categories.map((category) => (
            <AccordionItem key={category.id} value={category.slug}>
              <AccordionTrigger className="font-space-grotesk hover:text-primary text-base uppercase underline-offset-8">
                {category.name}
              </AccordionTrigger>

              <AccordionContent className="flex flex-col gap-4 px-4">
                {category.children!.map((child) => (
                  <Link
                    key={child.id}
                    href={`/${category.slug}/${child.slug}`}
                    className="hover:text-primary flex items-center justify-between capitalize underline-offset-8 hover:underline"
                  >
                    {child.name}
                    <ArrowRightIcon className="size-5" />
                  </Link>
                ))}

                <Link
                  href={`/${category.slug}`}
                  className="hover:text-primary flex items-center justify-between pl-2 capitalize underline-offset-8 hover:underline"
                >
                  View All
                  <ArrowRightIcon className="size-5" />
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
