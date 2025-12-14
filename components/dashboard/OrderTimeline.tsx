import { format } from "date-fns";
import { Circle, Package, Truck, CheckCircle, XCircle } from "lucide-react";

import { OrderWithRelations } from "@/types/prisma";

import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

const OrderTimeline = ({ order }: { order: OrderWithRelations }) => {
  const getStatusIcon = (status: string, isActive: boolean) => {
    const className = isActive ? "text-blue-600" : "text-gray-400";

    switch (status) {
      case "PENDING":
        return <Circle className={`h-5 w-5 ${className}`} />;
      case "PROCESSING":
        return <Package className={`h-5 w-5 ${className}`} />;
      case "SHIPPED":
        return <Truck className={`h-5 w-5 ${className}`} />;
      case "DELIVERED":
        return <CheckCircle className={`h-5 w-5 ${className}`} />;
      case "CANCELLED":
      case "REFUNDED":
        return <XCircle className={`h-5 w-5 ${className}`} />;
      default:
        return <Circle className={`h-5 w-5 ${className}`} />;
    }
  };

  const statusOrder = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentIndex = statusOrder.indexOf(order.status);

  const timeline = [
    {
      status: "PENDING",
      label: "Order Placed",
      date: order.createdAt,
      isActive: true,
    },
    {
      status: "PROCESSING",
      label: "Processing",
      date: order.status === "PROCESSING" ? order.updatedAt : null,
      isActive: currentIndex >= 1,
    },
    {
      status: "SHIPPED",
      label: "Shipped",
      date: order.status === "SHIPPED" ? order.updatedAt : null,
      isActive: currentIndex >= 2,
    },
    {
      status: "DELIVERED",
      label: "Delivered",
      date: order.status === "DELIVERED" ? order.updatedAt : null,
      isActive: currentIndex >= 3,
    },
  ];

  if (order.status === "CANCELLED" || order.status === "REFUNDED") {
    timeline.push({
      status: order.status,
      label: order.status === "CANCELLED" ? "Cancelled" : "Refunded",
      date: order.updatedAt,
      isActive: true,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {timeline.map((item, index) => (
            <div key={item.status} className="flex gap-4">
              <div className="flex flex-col items-center">
                {getStatusIcon(item.status, item.isActive)}
                {index < timeline.length - 1 && (
                  <div
                    className={`h-12 w-0.5 ${
                      item.isActive ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 pb-6">
                <p
                  className={`font-medium ${item.isActive ? "" : "text-gray-400"}`}
                >
                  {item.label}
                </p>
                {item.date && (
                  <p className="text-muted-foreground text-sm">
                    {format(new Date(item.date), "MMM dd, yyyy 'at' HH:mm")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderTimeline;
