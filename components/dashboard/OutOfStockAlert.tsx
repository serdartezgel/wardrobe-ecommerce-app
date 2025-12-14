import { PackageX } from "lucide-react";
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
import { getOutOfStockItems } from "@/lib/actions/inventory.action";
import { OutOfStockVariant } from "@/types/prisma";

import { QuickRestockButton } from "./QuickRestockButton";

export async function OutOfStockAlert() {
  const result = await getOutOfStockItems();

  if (!result.success || !result.data) {
    return <div>Failed to load out of stock items</div>;
  }

  const outOfStockItems = result.data as OutOfStockVariant[];

  if (outOfStockItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <PackageX className="text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="text-lg font-semibold">No items out of stock</h3>
        <p className="text-muted-foreground text-sm">
          All items are currently in stock
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {outOfStockItems.length} item(s) out of stock
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
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {outOfStockItems.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {variant.product.images[0] && (
                      <Image
                        src={variant.product.images[0].url}
                        alt={variant.product.name}
                        width={40}
                        height={40}
                        className="rounded object-cover opacity-50"
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
                  {variant.variantOptions
                    .map((vo: OutOfStockVariant) => vo.value)
                    .join(" / ")}
                </TableCell>
                <TableCell>{variant.id}</TableCell>
                <TableCell className="font-mono text-sm">
                  {variant.sku}
                </TableCell>
                <TableCell>
                  <Badge variant="destructive">Out of Stock</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <QuickRestockButton variantId={variant.id} currentStock={0} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
