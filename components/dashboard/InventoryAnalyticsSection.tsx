"use client";

import { format } from "date-fns";
import {
  AlertTriangleIcon,
  PackageIcon,
  TrendingUpIcon,
  XCircleIcon,
} from "lucide-react";
import { CartesianGrid, XAxis, YAxis, Bar, BarChart } from "recharts";

import { formatNumber, formatPercentage } from "@/lib/utils/analytics";
import { formatPrice, formatPriceNumber } from "@/lib/utils/price";

import AnalyticsStatsCard from "../cards/AnalyticsStatsCard";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const chartConfig = {
  value: {
    label: "Stock Value",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const InventoryAnalyticsSection = ({ data }: { data: InventoryAnalytics }) => {
  const categoryStockData = data.stockValue.byCategory.map((cat) => ({
    category: cat.categoryName,
    value: formatPriceNumber(cat.value),
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <AnalyticsStatsCard
          title="Total Stock Value"
          value={data.stockValue.totalValue}
          type="currency"
          icon={<PackageIcon className="h-4 w-4" />}
          description="Current inventory value"
        />
        <AnalyticsStatsCard
          title="Average Turnover Rate"
          value={data.turnoverRate.averageRate * 100}
          type="percentage"
          icon={<TrendingUpIcon className="h-4 w-4" />}
          description="Inventory turnover efficiency"
        />
        <AnalyticsStatsCard
          title="Slow-Moving Items"
          value={data.slowMovingItems.length}
          type="number"
          icon={<AlertTriangleIcon className="h-4 w-4" />}
          description="Items with 90+ days no sales"
        />
        <AnalyticsStatsCard
          title="Stock-Out Events"
          value={data.stockOutFrequency.totalStockOuts}
          type="number"
          icon={<XCircleIcon className="h-4 w-4" />}
          description="Total stock-out occurrences"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stock Value by Category</CardTitle>
            <CardDescription>Inventory value distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="max-h-72 w-full">
              <BarChart
                accessibilityLayer
                data={categoryStockData}
                layout="vertical"
                margin={{ left: 10, right: 10 }}
              >
                <CartesianGrid horizontal={false} />

                <XAxis type="number" tickLine={false} axisLine={false} />

                <YAxis
                  type="category"
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                />

                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />

                <Bar
                  dataKey="value"
                  fill="var(--color-value)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products with Frequent Stock-Outs</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Last Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.stockOutFrequency.affectedProducts
                  .slice(0, 5)
                  .map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell className="font-medium">
                        {product.productName}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive">
                          {product.stockOutCount}x
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-right text-sm">
                        {format(
                          new Date(product.lastStockOutDate),
                          "MMM dd, yyyy",
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Slow-Moving Inventory</CardTitle>
          <CardDescription>
            Products with no sales in the last 90+ days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Days Since Sale</TableHead>
                <TableHead className="text-right">Stock Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slowMovingItems.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell className="font-medium">
                    {item.productName}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(item.stock)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        item.daysSinceLastSale > 180
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {item.daysSinceLastSale} days
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(item.stockValue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Turnover Rates</CardTitle>
          <CardDescription>Products by turnover efficiency</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Turnover Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.turnoverRate.byProduct.map((product) => (
                <TableRow key={product.variantId}>
                  <TableCell className="font-medium">
                    {product.productName}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {product.sku}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(product.stock)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        product.turnoverRate > 0.5
                          ? "text-green-600"
                          : product.turnoverRate > 0.2
                            ? "text-yellow-600"
                            : "text-red-600"
                      }
                    >
                      {formatPercentage(product.turnoverRate * 100)}
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

export default InventoryAnalyticsSection;
