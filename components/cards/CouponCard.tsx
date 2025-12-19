"use client";

import { format } from "date-fns";
import {
  MoreVerticalIcon,
  PencilIcon,
  PowerIcon,
  Trash2Icon,
  TicketIcon,
  CopyIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteCoupon, toggleCouponStatus } from "@/lib/actions/coupon.action";
import { Prisma } from "@/lib/generated/prisma";
import { formatPrice } from "@/lib/utils/price";

type CouponWithRelations = Prisma.CouponGetPayload<{
  include: {
    collections: { include: { collection: true } };
  };
}>;

type CouponCardProps = {
  coupon: CouponWithRelations;
};

const CouponCard = ({ coupon }: CouponCardProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const now = new Date();
  const status = !coupon.isActive
    ? "inactive"
    : new Date(coupon.validFrom) > now
      ? "scheduled"
      : new Date(coupon.validUntil) < now
        ? "expired"
        : "active";

  const handleToggleStatus = () => {
    startTransition(async () => {
      const result = await toggleCouponStatus(coupon.id);

      if (result.success) {
        toast.success(
          coupon.isActive ? "Coupon deactivated" : "Coupon activated",
        );
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to update status");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCoupon(coupon.id);

      if (result.success) {
        toast.success("Coupon deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to delete coupon");
      }
      setShowDeleteDialog(false);
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code);
    toast.success("Coupon code copied to clipboard");
  };

  const getDiscountDisplay = () => {
    if (coupon.type === "PERCENTAGE") {
      return `${coupon.valueCents}% OFF`;
    }
    return `${formatPrice(coupon.valueCents)} OFF`;
  };

  return (
    <>
      <div className="bg-card group relative flex flex-col rounded-lg border p-4 transition-shadow hover:shadow-md">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <TicketIcon className="text-muted-foreground size-4" />
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
            </div>

            <div className="flex items-center gap-2">
              <code className="bg-muted rounded px-2 py-1 text-lg font-bold">
                {coupon.code}
              </code>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCopyCode}
                className="no-focus"
              >
                <CopyIcon className="size-3.5" />
              </Button>
            </div>
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
                  href={`/dashboard/deals-coupons/coupons/${coupon.id}/edit`}
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
                {coupon.isActive ? "Deactivate" : "Activate"}
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

          {coupon.minPurchaseCents && (
            <div className="flex items-center justify-between">
              <span>Min. Purchase:</span>
              <span>{formatPrice(coupon.minPurchaseCents)}</span>
            </div>
          )}

          {coupon.maxDiscountCents && (
            <div className="flex items-center justify-between">
              <span>Max. Discount:</span>
              <span>{formatPrice(coupon.maxDiscountCents)}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span>Usage:</span>
            <span>
              {coupon.usageCount}
              {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
            </span>
          </div>

          <div className="border-t pt-2">
            <div className="flex justify-between">
              <span>Valid from:</span>
              <span>{format(new Date(coupon.validFrom), "MMM dd, yyyy")}</span>
            </div>
            <div className="flex justify-between">
              <span>Valid until:</span>
              <span>{format(new Date(coupon.validUntil), "MMM dd, yyyy")}</span>
            </div>
          </div>

          {coupon.collections.length > 0 && (
            <div className="border-t pt-2">
              <span className="font-medium">Collections:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  {coupon.collections.length} collection
                  {coupon.collections.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete coupon &quot;{coupon.code}&quot;?
              This action cannot be undone.
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

export default CouponCard;
