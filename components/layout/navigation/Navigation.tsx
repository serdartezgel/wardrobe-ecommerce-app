"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { dealIcon } from "@/lib/constants/dealIcons";
import { Promotion } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";
import { CategoryWithChildren } from "@/types/prisma";

const Navigation = ({
  categories,
  deals,
}: {
  categories: CategoryWithChildren[];
  deals: Promotion[];
}) => {
  return (
    <NavigationMenu className="max-md:hidden">
      <NavigationMenuList className="font-space-grotesk flex items-center justify-start text-sm font-medium lg:gap-6">
        <NavigationMenuItem>
          <NavigationMenuTrigger className="cursor-pointer px-2 uppercase">
            <Link href={`/deals`}>DEALS</Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="w-[718px]">
              <div
                className={cn(
                  "grid grid-flow-col grid-rows-2 py-4",
                  deals.length > 6 && "grid-rows-3",
                  deals.length > 9 && "grid-rows-4",
                )}
              >
                {deals.map((deal) => {
                  const Icon = dealIcon[deal.type];
                  return (
                    <li key={deal.id}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={`/${deal.id}`}
                          className="font-space-grotesk mx-4 flex flex-row items-center justify-between gap-4 border-b py-2 text-sm leading-none font-medium capitalize"
                        >
                          <div className="flex items-center gap-2 capitalize">
                            <Icon className="text-primary" />
                            {deal.name}
                          </div>
                          <ArrowRightIcon className="size-4 text-inherit" />
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  );
                })}
                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      href={`/deals`}
                      className="flex items-center justify-between border-t px-2 py-1.5 underline-offset-8 hover:underline"
                    >
                      View All
                      <ArrowRightIcon className="size-4 text-inherit" />
                    </Link>
                  </NavigationMenuLink>
                </li>
              </div>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        {categories.map((category) => (
          <NavigationMenuItem key={category.id}>
            <NavigationMenuTrigger className="cursor-pointer px-2 uppercase">
              <Link href={`/${category.slug}`}>{category.name}</Link>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="w-[718px]">
                <div
                  className={cn(
                    "grid grid-flow-col grid-rows-2 py-4",
                    category.children!.length > 6 && "grid-rows-3",
                    category.children!.length > 9 && "grid-rows-4",
                  )}
                >
                  {category.children!.map((child) => (
                    <li key={child.id} className="py-4">
                      <NavigationMenuLink asChild>
                        <Link
                          href={`/${category.slug}/${child.slug}`}
                          className="font-space-grotesk mx-4 flex flex-row items-center justify-between gap-4 border-b py-2 text-sm leading-none font-medium capitalize"
                        >
                          {child.name}
                          <ArrowRightIcon className="size-4 text-inherit" />
                        </Link>
                      </NavigationMenuLink>
                      {child.children ? (
                        <ul>
                          {child.children.map((c) => (
                            <li key={c.id} className="px-2">
                              <NavigationMenuLink asChild>
                                <Link
                                  href={`/${category.slug}/${child.slug}/${c.slug}`}
                                  className="px-6 py-2 text-sm leading-none font-medium capitalize"
                                >
                                  {c.name}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <></>
                      )}
                    </li>
                  ))}
                </div>

                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      href={`/${category.slug}`}
                      className="flex items-center justify-between border-t px-2 py-1.5 underline-offset-8 hover:underline"
                    >
                      View All
                      <ArrowRightIcon className="size-4 text-inherit" />
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
export default Navigation;
