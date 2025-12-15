"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { toast } from "sonner";

import { updateOrderStatus } from "@/lib/actions/order.action";
import { OrderStatus } from "@/lib/generated/prisma";
import { OrderWithRelations } from "@/types/prisma";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

const UpdateOrderStatusForm = ({ order }: { order: OrderWithRelations }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber || "",
  );
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (status === order.status && trackingNumber === order.trackingNumber) {
      toast.info("No changes to save");
      return;
    }

    startTransition(async () => {
      const result = await updateOrderStatus({
        orderId: order.id,
        status,
        trackingNumber: trackingNumber || undefined,
        notes: notes || undefined,
      });

      if (result.success) {
        toast.success("Order updated successfully");
        router.refresh();
      } else {
        toast.error("Failed to update order", {
          description: result.error?.message,
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Order Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as OrderStatus)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(status === "SHIPPED" || order.trackingNumber) && (
          <div className="space-y-2">
            <Label htmlFor="tracking">Tracking Number</Label>
            <Input
              id="tracking"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add internal notes about this update..."
            rows={3}
          />
        </div>

        <Button onClick={handleSubmit} disabled={isPending} className="w-full">
          {isPending ? "Updating..." : "Update Order"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpdateOrderStatusForm;
