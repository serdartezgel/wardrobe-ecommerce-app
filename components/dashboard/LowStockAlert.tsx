import { Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLowStockItems } from "@/lib/actions/inventory.action";
import { LowStockVariant } from "@/types/prisma";

import { QuickRestockButton } from "./QuickRestockButton";

export async function LowStockAlert() {
  const result = await getLowStockItems(10);

  if (!result.success || !result.data) {
    return <div>Failed to load low stock items</div>;
  }

  const lowStockItems = result.data as LowStockVariant[];

  if (lowStockItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="text-lg font-semibold">All items are well stocked</h3>
        <p className="text-muted-foreground text-sm">
          No items with low stock at the moment
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {lowStockItems.length} item(s) with low stock (≤10 units)
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Variant ID</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Current Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lowStockItems.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {variant.product.images[0] && (
                      <Image
                        src={variant.product.images[0].url}
                        alt={variant.product.name}
                        width={40}
                        height={40}
                        className="rounded object-cover"
                      />
                    )}
                    <Link
                      href={`/dashboard/products/${variant.product.slug}`}
                      className="font-medium hover:underline"
                    >
                      {variant.product.name}
                    </Link>
                  </div>
                </TableCell>
                <TableCell>
                  {variant.variantOptions.map((vo) => vo.value).join(" / ")}
                </TableCell>
                <TableCell>{variant.id}</TableCell>
                <TableCell className="font-mono text-sm">
                  {variant.sku}
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold text-orange-600">
                    {variant.stock}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="border-orange-600 text-orange-600"
                  >
                    Low Stock
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <QuickRestockButton
                    variantId={variant.id}
                    currentStock={variant.stock}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
