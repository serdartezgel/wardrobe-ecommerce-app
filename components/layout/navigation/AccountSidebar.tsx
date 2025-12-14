"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User } from "@/lib/auth";
import { accountLinks } from "@/lib/constants/navLinks";
import { cn, getInitials } from "@/lib/utils";

const AccountSidebar = ({ user }: { user: User }) => {
  const pathname = usePathname();
  const initials = getInitials(user.name);

  return (
    <div className="bg-card sticky top-24 space-y-4 rounded-lg border p-6">
      <div className="flex items-center gap-3">
        <Avatar className="size-12">
          <AvatarImage src={user.image || undefined} alt={user.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <p className="truncate text-sm leading-tight font-semibold">
            {user.name}
          </p>
          <p className="text-muted-foreground truncate text-xs leading-tight">
            {user.email}
          </p>
        </div>
      </div>

      <Separator />

      {/* Navigation Links */}
      <nav className="space-y-1">
        {accountLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Button
              key={link.href}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                isActive && "font-medium",
              )}
              asChild
            >
              <Link href={link.href}>
                <Icon className="size-4" />
                <span>{link.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>
    </div>
  );
};

export default AccountSidebar;
