import { format } from "date-fns";
import { ArrowLeft, Truck, MapPin, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { OrderWithRelations } from "@/types/prisma";

import OrderTimeline from "./OrderTimeline";
import UpdateOrderStatusForm from "./UpdateOrderStatusForm";
import { Badge } from "../ui/badge";

const OrderStatusBadge = ({ status }: { status: string }) => {
  const variants: Record<
    string,
    {
      variant?:
        | "outline"
        | "default"
        | "destructive"
        | "secondary"
        | null
        | undefined;
      className?: string;
    }
  > = {
    PENDING: {
      variant: "outline",
      className: "border-orange-600 text-orange-600",
    },
    PROCESSING: { variant: "default", className: "bg-blue-600" },
    SHIPPED: { variant: "default", className: "bg-purple-600" },
    DELIVERED: { variant: "default", className: "bg-green-600" },
    CANCELLED: { variant: "destructive" },
    REFUNDED: {
      variant: "outline",
      className: "border-gray-600 text-gray-600",
    },
  };

  const config = variants[status] || variants.PENDING;

  return (
    <Badge variant={config.variant} className={config.className}>
      {status}
    </Badge>
  );
};

const OrderDetailView = ({ order }: { order: OrderWithRelations }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-muted-foreground">
            {format(new Date(order.createdAt), "MMMM dd, yyyy 'at' HH:mm")}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {item.productVariant.product.images[0] && (
                      <Image
                        src={item.productVariant.product.images[0].url}
                        alt={item.productVariant.product.name}
                        width={80}
                        height={80}
                        className="rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">
                        {item.productVariant.product.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {item.productVariant.variantOptions
                          .map((vo) => vo.value)
                          .join(" / ")}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        SKU: {item.productVariant.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.price.toString()}</p>
                      <p className="text-muted-foreground text-sm">
                        Qty: {item.quantity}
                      </p>
                      <p className="mt-1 font-semibold">
                        ${item.subtotal.toString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>${order.shipping.toString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${order.tax.toString()}</span>
                </div>
                {order.discount.toNumber() > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-${order.discount.toString()}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${order.total.toString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <OrderTimeline order={order} />
        </div>

        <div className="space-y-6">
          <UpdateOrderStatusForm order={order} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{order.user.name}</p>
              <p className="text-muted-foreground text-sm">
                {order.user.email}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="pt-2">Phone: {order.shippingAddress.phone}</p>
            </CardContent>
          </Card>

          {order.trackingNumber && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-sm">{order.trackingNumber}</p>
              </CardContent>
            </Card>
          )}

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailView;
