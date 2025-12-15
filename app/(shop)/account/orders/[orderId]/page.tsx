import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import OrderDetailCard from "@/components/cards/OrderDetailCard";
import OrderTimeline from "@/components/dashboard/OrderTimeline";
import OrderActions from "@/components/shop/account/OrderActions";
import OrderItemsList from "@/components/shop/account/OrderItemsList";
import OrderSummary from "@/components/shop/account/OrderSummary";
import { Button } from "@/components/ui/button";
import { getUserOrderById } from "@/lib/actions/order.action";

const CustormerOrderPage = async ({ params }: RouteParams) => {
  const { orderId } = await params;

  const result = await getUserOrderById(orderId);

  if (!result.success || !result.data) {
    notFound();
  }

  const order = result.data;

  return (
    <div className="space-y-6">
      <Button variant="link" size="sm" asChild className="gap-2 px-0!">
        <Link href="/account/orders">
          <ChevronLeftIcon className="size-4" />
          Back to Orders
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold">Order Details</h1>
        <p className="text-muted-foreground mt-2">Order #{order.orderNumber}</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <OrderTimeline order={order} />
        <div className="flex w-full flex-col justify-between gap-4">
          <OrderDetailCard order={order} />
          <OrderActions order={order} />
        </div>
      </div>
      <OrderItemsList items={order.items} />

      <OrderSummary order={order} />
    </div>
  );
};

export default CustormerOrderPage;
