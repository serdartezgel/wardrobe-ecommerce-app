import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils/price";
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
          <span className="font-medium">
            {formatPrice(order.subtotalCents)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium">
            {formatPrice(order.shippingCents)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span className="font-medium">{formatPrice(order.taxCents)}</span>
        </div>

        {order.discountCents > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="font-medium text-green-600">
              -{formatPrice(order.discountCents)}
            </span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold">
            {formatPrice(order.totalCents)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
