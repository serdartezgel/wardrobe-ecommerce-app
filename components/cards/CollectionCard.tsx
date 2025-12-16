"use client";

import { format } from "date-fns";
import {
  PackageIcon,
  PencilIcon,
  MoreVerticalIcon,
  PowerIcon,
  Trash2Icon,
  CopyIcon,
  RefreshCwIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { toast } from "sonner";

import {
  toggleCollectionStatus,
  deleteCollection,
  syncCollection,
} from "@/lib/actions/collection.action";
import { CollectionWithCount } from "@/types/prisma";

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

type CollectionCardProps = {
  collection: CollectionWithCount;
  variant?: "dashboard" | "shop";
};

const typeLabels: Record<string, string> = {
  MANUAL: "Manual",
  AUTOMATIC: "Automatic",
  SEASONAL: "Seasonal",
  DEAL: "Deal",
  NEW_ARRIVAL: "New Arrival",
  BESTSELLER: "Bestseller",
};

const CollectionCard = ({
  collection,
  variant = "shop",
}: CollectionCardProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isDashboard = variant === "dashboard";
  const linkHref = isDashboard
    ? `/dashboard/collections/${collection.slug}`
    : `/collections/${collection.slug}`;

  const handleToggleStatus = () => {
    startTransition(async () => {
      const result = await toggleCollectionStatus(collection.id);

      if (result.success) {
        toast.success(
          collection.isActive
            ? "Collection deactivated"
            : "Collection activated",
        );
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to update status");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCollection(collection.id);

      if (result.success) {
        toast.success("Collection deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to delete collection");
      }
      setShowDeleteDialog(false);
    });
  };

  const handleDuplicate = () => {
    router.push(`/dashboard/collections/create?duplicateId=${collection.id}`);
  };

  const handleSync = async () => {
    const result = await syncCollection({ id: collection.id });

    if (result.success && result.data) {
      toast.success("Collection synced", {
        description: `${result.data.added} products added`,
      });
    } else {
      toast.error("Sync failed", {
        description: result.error?.message,
      });
    }
  };

  const now = new Date();

  const status = (() => {
    if (!collection.isActive) return "Inactive";
    if (collection.validFrom && now < new Date(collection.validFrom))
      return "Scheduled";
    if (collection.validUntil && now > new Date(collection.validUntil))
      return "Expired";
    return "Active";
  })();

  return (
    <>
      <div className="bg-card group relative flex flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-md">
        <Link href={linkHref} className="relative aspect-[4/3]">
          <div className="bg-muted relative size-full overflow-hidden">
            {collection.image ? (
              <Image
                src={collection.image}
                alt={collection.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <PackageIcon className="text-muted-foreground size-16" />
              </div>
            )}
          </div>

          <div className="absolute top-2 left-2 flex flex-wrap gap-2">
            {collection.isFeatured && <Badge>Featured</Badge>}
            <Badge variant="secondary">{typeLabels[collection.type]}</Badge>
            <Badge
              variant={
                status === "Active"
                  ? "default"
                  : status === "Scheduled"
                    ? "secondary"
                    : "destructive"
              }
            >
              {status}
            </Badge>
          </div>
        </Link>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex-1">
            <Link href={linkHref} className="group/link block">
              <h3 className="line-clamp-2 font-semibold group-hover/link:underline">
                {collection.name}
              </h3>
            </Link>

            {collection.description && (
              <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                {collection.description}
              </p>
            )}

            <p className="text-muted-foreground mt-1 text-xs">
              /{collection.slug}
            </p>

            <div className="text-muted-foreground mt-2 space-y-1 text-xs">
              {collection.validFrom && (
                <div>
                  From: {format(new Date(collection.validFrom), "MMM dd, yyyy")}
                </div>
              )}
              {collection.validUntil && (
                <div>
                  Until:{" "}
                  {format(new Date(collection.validUntil), "MMM dd, yyyy")}
                </div>
              )}
            </div>

            <div className="text-muted-foreground mt-3 flex items-center gap-2 text-sm">
              <PackageIcon className="size-4" />
              <span>
                {collection._count.products}{" "}
                {collection._count.products === 1 ? "product" : "products"}
              </span>
            </div>
          </div>

          {isDashboard && (
            <div className="flex gap-2 border-t pt-3">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/dashboard/collections/${collection.slug}/edit`}>
                  <PencilIcon className="mr-2 size-3.5" />
                  Edit
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon-sm" className="no-focus">
                    <MoreVerticalIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <CopyIcon className="mr-2 size-4" />
                    Duplicate
                  </DropdownMenuItem>
                  {collection.type !== "MANUAL" && (
                    <DropdownMenuItem onClick={handleSync}>
                      <RefreshCwIcon className="mr-2 size-4" />
                      Sync Products
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleToggleStatus}
                    disabled={isPending}
                  >
                    <PowerIcon className="mr-2 size-4" />
                    {collection.isActive ? "Deactivate" : "Activate"}
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
          )}
        </div>
      </div>

      {isDashboard && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Collection</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{collection.name}&quot;?
                This action cannot be undone. Products in this collection will
                not be deleted.
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
      )}
    </>
  );
};

export default CollectionCard;
