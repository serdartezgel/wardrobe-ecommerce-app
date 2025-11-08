import {
  BarChart3,
  FolderTree,
  Layers,
  Layers2,
  LayoutDashboard,
  Package,
  Percent,
  Settings,
  ShoppingCart,
  Star,
  Tag,
  UserCog,
  Users,
} from "lucide-react";

import { UserRole } from "../generated/prisma";

export function getSidebarLinks(role: UserRole) {
  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/products", label: "Products", icon: Package },
    { href: "/dashboard/inventory", label: "Inventory", icon: Layers },
    { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
    { href: "/dashboard/customers", label: "Customers", icon: Users },
    { href: "/dashboard/categories", label: "Categories", icon: FolderTree },
    { href: "/dashboard/brands", label: "Brands", icon: Tag },
    { href: "/dashboard/collections", label: "Collections", icon: Layers2 },
    {
      href: "/dashboard/deals-coupons",
      label: "Deals & Coupons",
      icon: Percent,
    },
    { href: "/dashboard/reviews", label: "Reviews", icon: Star },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  ];

  if (role === "SUPER_ADMIN") {
    links.push(
      { href: "/dashboard/users", label: "Users", icon: UserCog },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    );
  }

  return links;
}
