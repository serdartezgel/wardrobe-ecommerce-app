"use client";

import { format } from "date-fns";
import {
  PercentIcon,
  MoreVerticalIcon,
  PencilIcon,
  PowerIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { toast } from "sonner";

import {
  togglePromotionStatus,
  deletePromotion,
} from "@/lib/actions/promotion.action";
import { formatPrice } from "@/lib/utils/price";
import { PromotionWithRelations } from "@/types/prisma";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const typeLabels: Record<string, string> = {
  PRODUCT_DISCOUNT: "Product Discount",
  FREE_SHIPPING: "Free Shipping",
  BOGO: "Buy One Get One",
  BUNDLE: "Bundle",
  CART_DISCOUNT: "Cart Discount",
};

const PromotionCard = ({
  promotion,
}: {
  promotion: PromotionWithRelations;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const now = new Date();
  const status = !promotion.isActive
    ? "inactive"
    : new Date(promotion.validFrom) > now
      ? "scheduled"
      : new Date(promotion.validUntil) < now
        ? "expired"
        : "active";

  const handleToggleStatus = () => {
    startTransition(async () => {
      const result = await togglePromotionStatus(promotion.id);

      if (result.success) {
        toast.success(
          promotion.isActive ? "Promotion deactivated" : "Promotion activated",
        );
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to update status");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePromotion(promotion.id);

      if (result.success) {
        toast.success("Promotion deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to delete promotion");
      }
      setShowDeleteDialog(false);
    });
  };

  const getDiscountDisplay = () => {
    if (promotion.type === "FREE_SHIPPING") return "Free Shipping";
    if (promotion.type === "BOGO") return "BOGO Deal";
    if (!promotion.discountType || !promotion.discountValueCents) return "—";

    if (promotion.discountType === "PERCENTAGE") {
      return `${promotion.discountValueCents}% OFF`;
    }
    return `${formatPrice(promotion.discountValueCents)} OFF`;
  };

  return (
    <>
      <div className="bg-card group relative flex flex-col rounded-lg border p-4 transition-shadow hover:shadow-md">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <PercentIcon className="text-muted-foreground size-4" />
              <Badge
                variant={
                  status === "active"
                    ? "default"
                    : status === "scheduled"
                      ? "outline"
                      : "destructive"
                }
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              <Badge variant="outline">{typeLabels[promotion.type]}</Badge>
            </div>

            <Link
              href={`/dashboard/deals-coupons/promotions/${promotion.id}`}
              className="group/link"
            >
              <h3 className="text-lg font-semibold group-hover/link:underline">
                {promotion.name}
              </h3>
            </Link>

            {promotion.code && (
              <p className="text-muted-foreground mt-1 font-mono text-sm">
                Code: {promotion.code}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-sm" className="no-focus">
                <MoreVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/deals-coupons/promotions/${promotion.id}/edit`}
                >
                  <PencilIcon className="mr-2 size-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleToggleStatus}
                disabled={isPending}
              >
                <PowerIcon className="mr-2 size-4" />
                {promotion.isActive ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isPending}
              >
                <Trash2Icon className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="text-muted-foreground space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Discount:</span>
            <span className="text-foreground font-semibold">
              {getDiscountDisplay()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span>Usage:</span>
            <span>
              {promotion.usageCount}
              {promotion.usageLimit ? ` / ${promotion.usageLimit}` : ""}
            </span>
          </div>

          <div className="border-t pt-2">
            <div className="flex justify-between">
              <span>Valid from:</span>
              <span>
                {format(new Date(promotion.validFrom), "MMM dd, yyyy")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Valid until:</span>
              <span>
                {format(new Date(promotion.validUntil), "MMM dd, yyyy")}
              </span>
            </div>
          </div>

          {(promotion.applicableCategories.length > 0 ||
            promotion.applicableBrands.length > 0 ||
            promotion.applicableProducts.length > 0 ||
            promotion.applicableCollections.length > 0) && (
            <div className="border-t pt-2">
              <span className="font-medium">Applies to:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {promotion.applicableCategories.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {promotion.applicableCategories.length} categories
                  </Badge>
                )}
                {promotion.applicableBrands.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {promotion.applicableBrands.length} brands
                  </Badge>
                )}
                {promotion.applicableProducts.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {promotion.applicableProducts.length} products
                  </Badge>
                )}
                {promotion.applicableCollections.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {promotion.applicableCollections.length} collections
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{promotion.name}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PromotionCard;
