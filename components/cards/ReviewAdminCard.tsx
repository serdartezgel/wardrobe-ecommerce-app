"use client";

import { format } from "date-fns";
import {
  MoreVerticalIcon,
  PackageIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { toast } from "sonner";

import {
  toggleReviewVerification,
  deleteReviewAdmin,
} from "@/lib/actions/review.action";
import { ReviewAdminWithRelations } from "@/types/prisma";

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

const ReviewAdminCard = ({ review }: { review: ReviewAdminWithRelations }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const productImage = review.product.images[0]?.url;

  const handleToggleVerification = () => {
    startTransition(async () => {
      const result = await toggleReviewVerification(review.id);

      if (result.success) {
        toast.success(
          review.isVerified
            ? "Review marked as unverified"
            : "Review marked as verified",
        );
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to update verification");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteReviewAdmin(review.id);

      if (result.success) {
        toast.success("Review deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to delete review");
      }
      setShowDeleteDialog(false);
    });
  };

  return (
    <>
      <div className="bg-card rounded-lg border p-4 sm:p-6">
        <div className="flex gap-4">
          <Link href={`/products/${review.product.slug}`} className="shrink-0">
            <div className="bg-muted relative size-16 overflow-hidden rounded-md sm:size-20">
              {productImage ? (
                <Image
                  src={productImage}
                  alt={review.product.name}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <PackageIcon className="text-muted-foreground size-8" />
                </div>
              )}
            </div>
          </Link>

          <div className="flex flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex-1">
                <Link
                  href={`/products/${review.product.slug}`}
                  className="group/link"
                >
                  <p className="text-muted-foreground text-xs">
                    {review.product.brand.name}
                  </p>
                  <h3 className="font-medium group-hover/link:underline">
                    {review.product.name}
                  </h3>
                </Link>
                <p className="font-medium">{review.user.name}</p>
                <p className="text-muted-foreground text-xs">
                  {review.user.email}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`size-4 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  {review.isVerified && (
                    <Badge variant="secondary" className="text-xs">
                      <ShieldCheckIcon className="mr-1 size-3" />
                      Verified Purchase
                    </Badge>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="no-focus">
                    <MoreVerticalIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleToggleVerification}
                    disabled={isPending}
                  >
                    {review.isVerified ? (
                      <>
                        <ShieldOffIcon className="mr-2 size-4" />
                        Mark as Unverified
                      </>
                    ) : (
                      <>
                        <ShieldCheckIcon className="mr-2 size-4" />
                        Mark as Verified
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isPending}
                  >
                    <Trash2Icon className="mr-2 size-4" />
                    Delete Review
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {review.title && <h4 className="font-medium">{review.title}</h4>}

            {review.comment && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {review.comment}
              </p>
            )}

            <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
              <span>{format(new Date(review.createdAt), "MMM dd, yyyy")}</span>
              <span>•</span>
              <span>Order #{review.order.orderNumber}</span>
              <span>•</span>
              <span>By {review.user.name}</span>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review from{" "}
              {review.user.name}? This action cannot be undone.
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

export default ReviewAdminCard;
