"use client";

import {
  DollarSignIcon,
  TagIcon,
  TrendingUpIcon,
  TruckIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { formatPrice, formatPriceNumber } from "@/lib/utils/price";

import AnalyticsStatsCard from "../cards/AnalyticsStatsCard";
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

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  orders: { label: "Orders", color: "var(--chart-2)" },
  tax: { label: "Tax", color: "var(--chart-3)" },
  shipping: { label: "Shipping", color: "var(--chart-4)" },
} satisfies ChartConfig;

const FinancialReportSection = ({ data }: { data: FinancialReport }) => {
  const revenueTrendData = data.revenueTrends.map((item) => ({
    date: item.date,
    revenue: formatPriceNumber(item.revenue),
    orders: item.orders,
  }));

  const taxData = data.taxCollected.byPeriod.map((item) => ({
    date: item.date,
    tax: formatPriceNumber(item.amount),
  }));

  const shippingData = data.shippingRevenue.byPeriod.map((item) => ({
    date: item.date,
    shipping: formatPriceNumber(item.amount),
  }));

  const combinedRevenueData = data.revenueTrends.map((item, index) => ({
    date: item.date,
    revenue: formatPriceNumber(item.revenue),
    tax: formatPriceNumber(data.taxCollected.byPeriod[index]?.amount || 0),
    shipping: formatPriceNumber(
      data.shippingRevenue.byPeriod[index]?.amount || 0,
    ),
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <AnalyticsStatsCard
          title="Tax Collected"
          value={data.taxCollected.total}
          type="currency"
          icon={<DollarSignIcon className="h-4 w-4" />}
          description="Total tax revenue"
        />
        <AnalyticsStatsCard
          title="Shipping Revenue"
          value={data.shippingRevenue.total}
          type="currency"
          icon={<TruckIcon className="h-4 w-4" />}
          description={`Avg: ${formatPrice(data.shippingRevenue.average)}`}
        />
        <AnalyticsStatsCard
          title="Total Discounts"
          value={data.discountImpact.totalDiscounts}
          type="currency"
          icon={<TagIcon className="h-4 w-4" />}
          description={`${data.discountImpact.discountedOrders} orders`}
        />
        <AnalyticsStatsCard
          title="Discount Impact"
          value={data.discountImpact.percentageOfOrders}
          type="percentage"
          icon={<TrendingUpIcon className="h-4 w-4" />}
          description={`Avg: ${formatPrice(data.discountImpact.averageDiscount)}`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Daily revenue and order volume</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="max-h-80 w-full">
            <LineChart accessibilityLayer data={revenueTrendData}>
              <CartesianGrid vertical={false} />

              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis yAxisId="revenue" tickLine={false} axisLine={false} />
              <YAxis
                yAxisId="orders"
                orientation="right"
                tickLine={false}
                axisLine={false}
              />

              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

              <Line
                yAxisId="revenue"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                strokeWidth={3}
                dot={false}
              />
              <Line
                yAxisId="orders"
                dataKey="orders"
                stroke="var(--color-orders)"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>
            Revenue, tax, and shipping over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="max-h-80 w-full">
            <AreaChart accessibilityLayer data={combinedRevenueData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />

              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

              <Area
                dataKey="revenue"
                stackId="1"
                stroke="var(--color-revenue)"
                fill="var(--color-revenue)"
              />
              <Area
                dataKey="tax"
                stackId="1"
                stroke="var(--color-tax)"
                fill="var(--color-tax)"
              />
              <Area
                dataKey="shipping"
                stackId="1"
                stroke="var(--color-shipping)"
                fill="var(--color-shipping)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tax Collection Trend</CardTitle>
            <CardDescription>Tax collected over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="max-h-64 w-full">
              <LineChart accessibilityLayer data={taxData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />

                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />

                <Line
                  dataKey="tax"
                  stroke="var(--color-tax)"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Revenue Trend</CardTitle>
            <CardDescription>Shipping charges over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="max-h-64 w-full">
              <LineChart accessibilityLayer data={shippingData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />

                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />

                <Line
                  dataKey="shipping"
                  stroke="var(--color-shipping)"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discount Impact Analysis</CardTitle>
          <CardDescription>How discounts affect your revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                Total Discounts Given
              </p>
              <p className="text-2xl font-bold">
                {formatPrice(data.discountImpact.totalDiscounts)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                Orders with Discounts
              </p>
              <p className="text-2xl font-bold">
                {data.discountImpact.discountedOrders}
              </p>
              <p className="text-muted-foreground text-xs">
                {data.discountImpact.percentageOfOrders.toFixed(1)}% of all
                orders
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Average Discount</p>
              <p className="text-2xl font-bold">
                {formatPrice(data.discountImpact.averageDiscount)}
              </p>
              <p className="text-muted-foreground text-xs">
                per discounted order
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReportSection;
