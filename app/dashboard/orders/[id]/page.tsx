import { notFound } from "next/navigation";

import OrderDetailView from "@/components/dashboard/OrderDetailView";
import { getOrderById } from "@/lib/actions/order.action";

const OrderDetailsPage = async ({ params }: RouteParams) => {
  const { id } = await params;
  const result = await getOrderById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return <OrderDetailView order={result.data} />;
};

export default OrderDetailsPage;
