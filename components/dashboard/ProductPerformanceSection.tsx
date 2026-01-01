import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { formatNumber, formatPercentage } from "@/lib/utils/analytics";
import { formatPrice } from "@/lib/utils/price";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const ProductPerformanceSection = ({ data }: { data: ProductPerformance }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5 text-green-600" />
            Best Selling Products
          </CardTitle>
          <CardDescription>Top performing products by revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.bestSellers.map((product) => (
                <TableRow key={product.productId}>
                  <TableCell className="font-medium">
                    {product.productName}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(product.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(product.totalQuantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDownIcon className="h-5 w-5 text-red-600" />
            Worst Performing Products
          </CardTitle>
          <CardDescription>Products needing attention</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.worstPerformers.map((product) => (
                <TableRow key={product.productId}>
                  <TableCell className="font-medium">
                    {product.productName}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(product.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(product.totalQuantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Product Profitability</CardTitle>
          <CardDescription>Revenue, cost, and profit margins</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.revenueByProduct.slice(0, 10).map((product) => (
                <TableRow key={product.productId}>
                  <TableCell className="font-medium">
                    {product.productName}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(product.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(product.profit)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        product.profitMargin > 30
                          ? "text-green-600"
                          : product.profitMargin > 15
                            ? "text-yellow-600"
                            : "text-red-600"
                      }
                    >
                      {formatPercentage(product.profitMargin)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductPerformanceSection;
