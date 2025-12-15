import { format } from "date-fns";
import { CalendarIcon, MapPinIcon, PackageIcon, TruckIcon } from "lucide-react";

import { OrderWithRelations } from "@/types/prisma";

import { Badge } from "../ui/badge";

const statusConfig = {
  PENDING: {
    label: "Pending",
    variant: "outline" as const,
    color: "text-yellow-600",
  },
  PROCESSING: {
    label: "Processing",
    variant: "outline" as const,
    color: "text-blue-600",
  },
  SHIPPED: {
    label: "Shipped",
    variant: "outline" as const,
    color: "text-purple-600",
  },
  DELIVERED: {
    label: "Delivered",
    variant: "default" as const,
    color: "text-green-600",
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "destructive" as const,
    color: "text-red-600",
  },
  REFUNDED: {
    label: "Refunded",
    variant: "destructive" as const,
    color: "text-red-600",
  },
};

const OrderDetailCard = ({ order }: { order: OrderWithRelations }) => {
  const statusInfo = statusConfig[order.status as keyof typeof statusConfig];

  return (
    <div className="bg-card w-full space-y-6 rounded-lg border p-6">
      <div className="flex items-center gap-3">
        <PackageIcon className={`size-5 ${statusInfo.color}`} />
        <div>
          <p className="text-muted-foreground text-sm">Order Status</p>
          <Badge variant={statusInfo.variant} className="mt-1">
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-around gap-6">
        <div className="flex items-start gap-3">
          <CalendarIcon className="text-muted-foreground size-5" />
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Order Date</p>
            <p className="font-medium">
              {format(new Date(order.createdAt), "MMM dd, yyyy")}
            </p>
            <p className="text-muted-foreground text-xs">
              {format(new Date(order.createdAt), "hh:mm a")}
            </p>
          </div>
        </div>

        {order.trackingNumber && (
          <div className="flex items-start gap-3">
            <TruckIcon className="text-muted-foreground size-5" />
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Tracking Number</p>
              <p className="font-medium">{order.trackingNumber}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 sm:col-span-2 lg:col-span-1">
          <MapPinIcon className="text-muted-foreground size-5" />
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm">Shipping Address</p>
            <p className="font-medium">{order.shippingAddress.fullName}</p>
            <p className="text-muted-foreground text-sm">
              {order.shippingAddress.addressLine1}
            </p>
            {order.shippingAddress.addressLine2 && (
              <p className="text-muted-foreground text-sm">
                {order.shippingAddress.addressLine2}
              </p>
            )}
            <p className="text-muted-foreground text-sm">
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.zipCode}
            </p>
            <p className="text-muted-foreground text-sm">
              {order.shippingAddress.phone}
            </p>
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="bg-muted rounded-md p-4">
          <p className="text-sm font-medium">Notes</p>
          <p className="text-muted-foreground mt-1 text-sm">{order.notes}</p>
        </div>
      )}
    </div>
  );
};

export default OrderDetailCard;
