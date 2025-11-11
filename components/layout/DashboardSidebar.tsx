"use client";

import { ArrowLeftIcon, LogOutIcon, User2Icon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/auth-client";
import { UserRole } from "@/lib/generated/prisma";
import { getSidebarLinks } from "@/lib/utils/sidebar-links";

import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role: UserRole;
}

const DashboardSidebar = ({ role, ...props }: DashboardSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();

  const isActivePath = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    try {
      await signOut();

      toast.success("Signed out successfully");

      router.push("/sign-in");
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Sign out failed", {
          description: error.message || "Failed to sign out",
        });
      } else {
        toast.error("Sign out failed", {
          description: "Failed to sign out",
        });
      }
    }
  };

  const links = getSidebarLinks(role);

  return (
    <Sidebar {...props}>
      <SidebarHeader className="mx-auto my-4">
        <Link
          href={"/dashboard"}
          className={
            state === "collapsed"
              ? "hidden"
              : "text-primary font-space-grotesk text-3xl font-extrabold"
          }
        >
          WARDROBE
        </Link>
        <Link
          href={"/"}
          className="text-accent-foreground mx-auto flex items-center gap-1 text-xs"
        >
          <ArrowLeftIcon size={16} />
          <p className={state === "collapsed" ? "hidden" : ""}>
            Go back to shop
          </p>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col justify-between">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.label}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          isActive={isActivePath(item.href)}
                        >
                          <Link
                            href={item.href}
                            className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors"
                          >
                            <Icon className="size-5" />
                            {item.label}
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent
                        className={state === "expanded" ? "hidden" : ""}
                      >
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      asChild
                      isActive={isActivePath("/dashboard/profile")}
                    >
                      <Link
                        href={"/dashboard/profile"}
                        className="flex items-center gap-3 px-4 py-3 font-medium transition-colors"
                      >
                        <User2Icon className="size-5" />
                        Profile
                      </Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent
                    className={state === "expanded" ? "hidden" : ""}
                  >
                    <p>Profile</p>
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      onClick={handleSignOut}
                      className="text-destructive mb-12 flex cursor-pointer items-center gap-3 px-4 py-3 font-medium transition-colors"
                    >
                      <LogOutIcon className="size-5" />
                      Sign Out
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent
                    className={state === "expanded" ? "hidden" : ""}
                  >
                    <p>Sign Out</p>
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
