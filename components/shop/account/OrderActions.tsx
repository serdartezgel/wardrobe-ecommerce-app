"use client";

import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cancelUserOrder } from "@/lib/actions/order.action";
import logger from "@/lib/logger";
import { OrderWithRelations } from "@/types/prisma";

const OrderActions = ({ order }: { order: OrderWithRelations }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const canCancel = ["PENDING", "PROCESSING"].includes(order.status);

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const result = await cancelUserOrder(order.id, cancelReason);

      if (result.success) {
        toast.success("Order cancelled successfully");
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to cancel order");
      }
    } catch (error) {
      logger.error(`Failed to cancel order: ${error}`);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!canCancel) {
    return null;
  }

  return (
    <div className="bg-card flex items-center justify-between rounded-lg border p-4">
      <div>
        <p className="font-medium">Need to cancel?</p>
        <p className="text-muted-foreground text-sm">
          You can cancel this order if it hasn&apos;t shipped yet
        </p>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size={"lg"}
            disabled={isLoading}
            className="cursor-pointer"
          >
            <XIcon className="mr-2 size-4" />
            Cancel Order
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4">
            <label className="mb-2 block text-sm font-medium">
              Reason for cancellation (optional)
            </label>
            <Textarea
              placeholder="Tell us why you're cancelling..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? "Cancelling..." : "Cancel Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderActions;
