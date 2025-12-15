import { Separator } from "@/components/ui/separator";
import { OrderWithRelations } from "@/types/prisma";

type OrderSummaryProps = {
  order: OrderWithRelations;
};

const OrderSummary = ({ order }: OrderSummaryProps) => {
  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{order.subtotal.toNumber()}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium">{order.shipping.toNumber()}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span className="font-medium">{order.tax.toNumber()}</span>
        </div>

        {order.discount.toNumber() > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="font-medium text-green-600">
              -{order.discount.toNumber()}
            </span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold">{order.total.toNumber()}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
