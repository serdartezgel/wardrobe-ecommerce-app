import { PackageIcon } from "lucide-react";
import Link from "next/link";

import OrderCard from "@/components/cards/OrderCard";
import { Button } from "@/components/ui/button";
import { getUserOrders } from "@/lib/actions/order.action";

const CustomerOrdersPage = async () => {
  const result = await getUserOrders();

  const orders = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your orders
          </p>
        </div>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="bg-card flex flex-col items-center justify-center rounded-lg border p-12 text-center">
          <PackageIcon className="text-muted-foreground mb-4 size-16" />
          <h3 className="mb-2 text-lg font-semibold">No orders yet</h3>
          <p className="text-muted-foreground mb-6 text-sm">
            Start shopping to see your orders here
          </p>
          <Button asChild>
            <Link href="/">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrdersPage;
