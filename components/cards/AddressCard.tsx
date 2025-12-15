"use client";

import {
  CheckCircle2Icon,
  PencilIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { toast } from "sonner";

import { setDefaultAddress, deleteAddress } from "@/lib/actions/address.action";
import { Address } from "@/lib/generated/prisma";

import AddressDialog from "../shop/account/AddressDialog";
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

const AddressCard = ({ address }: { address: Address }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSetDefault = () => {
    startTransition(async () => {
      const result = await setDefaultAddress(address.id);

      if (result.success) {
        toast.success("Default address updated");
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to update address");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAddress(address.id);

      if (result.success) {
        toast.success("Address deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to delete address");
      }
      setShowDeleteDialog(false);
    });
  };

  return (
    <div className="bg-card group relative rounded-lg border p-6 transition-shadow hover:shadow-md">
      {address.isDefault && (
        <Badge className="absolute top-4 right-4 gap-1">
          <CheckCircle2Icon className="size-3" />
          Default
        </Badge>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold">{address.fullName}</h3>
            <p className="text-muted-foreground text-sm">{address.phone}</p>
          </div>

          <div className="text-muted-foreground text-sm">
            <p>{address.addressLine1}</p>
            {address.addressLine2 && <p>{address.addressLine2}</p>}
            <p>
              {address.city}, {address.state} {address.zipCode}
            </p>
            <p>{address.country}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-end gap-2">
          {!address.isDefault && (
            <>
              <Button
                size={"sm"}
                onClick={handleSetDefault}
                disabled={isPending}
              >
                <StarIcon className="mr-2 size-4" />
                Set as Default
              </Button>
            </>
          )}

          <AddressDialog address={address}>
            <Button variant="outline" disabled={isPending} className="h-8">
              <PencilIcon className="mr-2 size-4" />
              Edit
            </Button>
          </AddressDialog>

          <Button
            onClick={() => setShowDeleteDialog(true)}
            disabled={isPending}
            variant="destructive"
            size={"sm"}
          >
            <Trash2Icon className="mr-2 size-4" />
            Delete
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot
              be undone.
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
    </div>
  );
};

export default AddressCard;
