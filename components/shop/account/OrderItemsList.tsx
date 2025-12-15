import { PackageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/utils/price";
import { OrderWithRelations } from "@/types/prisma";

const OrderItemsList = ({ items }: { items: OrderWithRelations["items"] }) => {
  return (
    <div className="bg-card space-y-4 rounded-lg border p-6">
      <h2 className="text-xl font-semibold">Order Items</h2>

      <div className="space-y-4">
        {items.map((item) => {
          const product = item.productVariant.product;
          const imageUrl = product.images[0]?.url;

          return (
            <Link
              key={item.id}
              href={`/products/${product.slug}`}
              className="group hover:bg-muted/50 flex items-center gap-4 rounded-lg border p-4 transition-colors"
            >
              <div className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-md sm:size-24">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <PackageIcon className="text-muted-foreground size-8" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-medium group-hover:underline">
                    {product.name}
                  </h3>
                  <div className="text-muted-foreground mt-1 flex flex-wrap gap-2 text-sm">
                    {item.productVariant.variantOptions.map((vo) => (
                      <span key={vo.id}>
                        {vo.option.name}: {vo.value}
                      </span>
                    ))}
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    SKU: {item.productVariant.sku}
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Qty: {item.quantity}
                  </span>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(item.subtotalCents)}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {formatPrice(item.priceCents)} each
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default OrderItemsList;
