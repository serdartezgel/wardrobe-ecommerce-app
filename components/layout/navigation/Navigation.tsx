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
import { navLinks } from "@/lib/constants/navLinks";

const Navigation = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList className="font-space-grotesk flex w-1/3 items-center justify-start text-sm font-medium max-md:hidden lg:gap-8">
        {navLinks.map((section) => (
          <NavigationMenuItem key={section.label}>
            <NavigationMenuTrigger>
              <Link href={section.href}>{section.label}</Link>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="w-[718px]">
                <div className="grid grid-cols-3 py-4">
                  {section.children!.map((child) => (
                    <li key={child.label} className="py-4">
                      <NavigationMenuLink asChild>
                        <Link
                          href={child.href}
                          className="mx-4 flex flex-row justify-between border-b py-2 text-sm leading-none font-medium"
                        >
                          {child.label}
                          <ArrowRightIcon className="size-4 text-inherit" />
                        </Link>
                      </NavigationMenuLink>
                      {child.children ? (
                        <ul>
                          {child.children.map((child) => (
                            <li key={child.label} className="px-2">
                              <NavigationMenuLink asChild>
                                <Link
                                  href={child.href}
                                  className="px-6 py-2 text-sm leading-none font-medium"
                                >
                                  {child.label}
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
                      href={section.href}
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
