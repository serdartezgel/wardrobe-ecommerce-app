import { Suspense } from "react";

import OrderStats from "@/components/cards/OrderStats";
import OrdersTable from "@/components/tables/OrdersTable";
import { getAllOrders } from "@/lib/actions/order.action";

const OrdersPage = async () => {
  const result = await getAllOrders();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track customer orders
          </p>
        </div>
      </header>

      <Suspense fallback={<div>Loading stats...</div>}>
        <OrderStats />
      </Suspense>

      <Suspense fallback={<div>Loading orders...</div>}>
        <OrdersTable orders={result.data ? result.data.orders : []} />
      </Suspense>
    </div>
  );
};
export default OrdersPage;
