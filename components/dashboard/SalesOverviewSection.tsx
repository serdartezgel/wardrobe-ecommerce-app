"use client";

import { DollarSignIcon, ShoppingCartIcon, TrendingUpIcon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

import { formatPriceNumber } from "@/lib/utils/price";

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
  sales: {
    label: "Sales",
    color: "var(--chart-1)",
  },
  orders: {
    label: "Orders",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const SalesOverviewSection = ({ data }: { data: SalesOverview }) => {
  const chartData = data.salesByPeriod.map((item) => ({
    date: item.date,
    sales: formatPriceNumber(item.sales),
    orders: item.orders,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <AnalyticsStatsCard
          title="Total Sales"
          value={data.totalSales}
          type="currency"
          change={data.previousPeriodComparison.salesChange}
          icon={<DollarSignIcon className="h-4 w-4" />}
        />
        <AnalyticsStatsCard
          title="Number of Orders"
          value={data.numberOfOrders}
          type="number"
          change={data.previousPeriodComparison.ordersChange}
          icon={<ShoppingCartIcon className="h-4 w-4" />}
        />
        <AnalyticsStatsCard
          title="Average Order Value"
          value={data.averageOrderValue}
          type="currency"
          change={data.previousPeriodComparison.aovChange}
          icon={<TrendingUpIcon className="h-4 w-4" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
          <CardDescription>Daily sales and order volume</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="max-h-80 w-full">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 10, right: 10, top: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis yAxisId="sales" tickLine={false} axisLine={false} />
              <YAxis
                yAxisId="orders"
                orientation="right"
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                yAxisId="sales"
                dataKey="sales"
                type="monotone"
                stroke="var(--color-sales)"
                strokeWidth={3}
                dot={false}
              />
              <Line
                yAxisId="orders"
                dataKey="orders"
                type="monotone"
                stroke="var(--color-orders)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesOverviewSection;
