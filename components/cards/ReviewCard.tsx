"use client";

import { format } from "date-fns";
import {
  PackageIcon,
  StarIcon,
  MoreVerticalIcon,
  PencilIcon,
  Trash2Icon,
  ShieldCheckIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { toast } from "sonner";

import { deleteReview } from "@/lib/actions/review.action";
import { ReviewWithRelations } from "@/types/prisma";

import ReviewDialog from "../shop/account/ReviewDialog";
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

const ReviewCard = ({ review }: { review: ReviewWithRelations }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const imageUrl = review.product.images[0]?.url;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteReview(review.id);

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
      <div className="bg-card rounded-lg border p-6">
        <div className="flex gap-4">
          <Link href={`/products/${review.product.slug}`} className="shrink-0">
            <div className="bg-muted relative size-20 overflow-hidden rounded-md sm:size-24">
              {imageUrl ? (
                <Image
                  src={imageUrl}
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
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <Link
                  href={`/products/${review.product.slug}`}
                  className="group/link"
                >
                  <p className="text-muted-foreground text-xs">
                    {review.product.brand.name}
                  </p>
                  <h3 className="mt-1 font-medium group-hover/link:underline">
                    {review.product.name}
                  </h3>
                </Link>

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
                  <Button variant="ghost" size="icon-sm">
                    <MoreVerticalIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <ReviewDialog
                    productId={review.productId}
                    orderId={review.orderId}
                    productName={review.product.name}
                    existingReview={review}
                  >
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <PencilIcon className="mr-2 size-4" />
                      Edit Review
                    </DropdownMenuItem>
                  </ReviewDialog>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    variant="destructive"
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
              <p className="text-muted-foreground text-sm">{review.comment}</p>
            )}

            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span>{format(new Date(review.createdAt), "MMM dd, yyyy")}</span>
              <span>•</span>
              <span>Order #{review.order.orderNumber}</span>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be
              undone.
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

export default ReviewCard;
