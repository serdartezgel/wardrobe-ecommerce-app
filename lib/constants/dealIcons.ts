import {
  GiftIcon,
  PackageIcon,
  ShoppingCartIcon,
  TagIcon,
  TruckIcon,
} from "lucide-react";

import { PromotionType } from "../generated/prisma";

export const dealIcon: Record<
  PromotionType,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  [PromotionType.PRODUCT_DISCOUNT]: TagIcon,
  [PromotionType.FREE_SHIPPING]: TruckIcon,
  [PromotionType.BOGO]: GiftIcon,
  [PromotionType.BUNDLE]: PackageIcon,
  [PromotionType.CART_DISCOUNT]: ShoppingCartIcon,
};
