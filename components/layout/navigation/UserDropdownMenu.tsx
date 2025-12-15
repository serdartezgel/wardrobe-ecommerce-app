"use client";

import { LogOutIcon, User2Icon, LayoutDashboardIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/lib/auth";
import { signOut } from "@/lib/auth-client";
import { accountLinks } from "@/lib/constants/navLinks";
import { getInitials } from "@/lib/utils";

const UserDropdownMenu = ({ user }: { user: User }) => {
  const router = useRouter();

  const initials = getInitials(user.name);

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-lg" className="no-focus">
          <User2Icon className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Avatar className="size-11">
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <p className="truncate text-sm leading-tight font-medium">
              {user.name}
            </p>
            <p className="text-muted-foreground truncate text-xs leading-tight">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.role !== "CUSTOMER" ? (
          <>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard"
                className="flex cursor-pointer items-center gap-2"
              >
                <LayoutDashboardIcon className="size-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            {accountLinks.map((link) => {
              const Icon = link.icon;
              return (
                <DropdownMenuItem key={link.href} asChild>
                  <Link
                    href={link.href}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Icon className="size-4" />
                    <span>{link.label}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button
            variant={"destructive"}
            onClick={handleSignOut}
            className="flex w-full cursor-pointer items-center gap-2"
          >
            <LogOutIcon className="text-foreground size-4" />
            <span>Sign Out</span>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdownMenu;
