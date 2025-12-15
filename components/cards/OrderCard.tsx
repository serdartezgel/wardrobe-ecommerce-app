import { format } from "date-fns";
import { ChevronRightIcon, PackageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { OrderWithRelations } from "@/types/prisma";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const statusConfig = {
  PENDING: { label: "Pending", variant: "outline" as const },
  PROCESSING: { label: "Processing", variant: "outline" as const },
  SHIPPED: { label: "Shipped", variant: "outline" as const },
  DELIVERED: { label: "Delivered", variant: "default" as const },
  CANCELLED: { label: "Cancelled", variant: "destructive" as const },
  REFUNDED: { label: "Refunded", variant: "destructive" as const },
};

const OrderCard = ({ order }: { order: OrderWithRelations }) => {
  const statusInfo = statusConfig[order.status as keyof typeof statusConfig];
  const firstItem = order.items[0];
  const remainingItems = order.items.length - 1;

  return (
    <Link href={`/account/orders/${order.id}`}>
      <div className="bg-card group cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-md sm:size-24">
              {firstItem?.productVariant.product.images[0]?.url ? (
                <Image
                  src={firstItem.productVariant.product.images[0].url}
                  alt={firstItem.productVariant.product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <PackageIcon className="text-muted-foreground size-8" />
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">Order #{order.orderNumber}</p>
                  <p className="text-muted-foreground text-sm">
                    {format(new Date(order.createdAt), "MMM dd, yyyy")}
                  </p>
                </div>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>

              <div className="text-muted-foreground text-sm">
                <p className="text-foreground font-medium">
                  {firstItem?.productVariant.product.name}
                </p>
                {firstItem?.productVariant.variantOptions.map((vo) => (
                  <span key={vo.id} className="mr-2">
                    {vo.option.name}: {vo.value}
                  </span>
                ))}
                {remainingItems > 0 && (
                  <p className="mt-1">
                    +{remainingItems} more{" "}
                    {remainingItems === 1 ? "item" : "items"}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  items
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="font-semibold">{order.total.toNumber()}</span>
              </div>
            </div>
          </div>

          <Button
            variant="link"
            size="icon"
            className="shrink-0 transition-transform group-hover:translate-x-1"
          >
            <ChevronRightIcon className="size-5" />
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default OrderCard;
