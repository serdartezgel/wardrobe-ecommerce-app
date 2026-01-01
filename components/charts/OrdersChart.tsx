"use client";

import { useEffect, useState, useTransition } from "react";
import { Pie, PieChart } from "recharts";

import { TIMEFRAMES, TimeframeValue } from "@/lib/constants/timeframes";
import { OrderStatus } from "@/lib/generated/prisma";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";

const COLORS = [
  "#facc15", // Pending
  "#3b82f6", // Processing
  "#8b5cf6", // Shipped
  "#16a34a", // Delivered
  "#ef4444", // Cancelled
  "#6b7280", // Refunded
];

const dummyOrdersData: Record<
  string,
  { name: string; value: number; fill: string }[]
> = {
  last_24_hours: [
    { name: OrderStatus.PENDING, value: 5, fill: COLORS[0] },
    { name: OrderStatus.PROCESSING, value: 3, fill: COLORS[1] },
    { name: OrderStatus.SHIPPED, value: 7, fill: COLORS[2] },
    { name: OrderStatus.DELIVERED, value: 10, fill: COLORS[3] },
    { name: OrderStatus.CANCELLED, value: 1, fill: COLORS[4] },
    { name: OrderStatus.REFUNDED, value: 0, fill: COLORS[5] },
  ],
  last_7_days: [
    { name: OrderStatus.PENDING, value: 20, fill: COLORS[0] },
    { name: OrderStatus.PROCESSING, value: 15, fill: COLORS[1] },
    { name: OrderStatus.SHIPPED, value: 30, fill: COLORS[2] },
    { name: OrderStatus.DELIVERED, value: 50, fill: COLORS[3] },
    { name: OrderStatus.CANCELLED, value: 5, fill: COLORS[4] },
    { name: OrderStatus.REFUNDED, value: 2, fill: COLORS[5] },
  ],
  last_30_days: [
    { name: OrderStatus.PENDING, value: 50, fill: COLORS[0] },
    { name: OrderStatus.PROCESSING, value: 40, fill: COLORS[1] },
    { name: OrderStatus.SHIPPED, value: 80, fill: COLORS[2] },
    { name: OrderStatus.DELIVERED, value: 120, fill: COLORS[3] },
    { name: OrderStatus.CANCELLED, value: 10, fill: COLORS[4] },
    { name: OrderStatus.REFUNDED, value: 5, fill: COLORS[5] },
  ],
  this_week: [
    { name: OrderStatus.PENDING, value: 15, fill: COLORS[0] },
    { name: OrderStatus.PROCESSING, value: 20, fill: COLORS[1] },
    { name: OrderStatus.SHIPPED, value: 35, fill: COLORS[2] },
    { name: OrderStatus.DELIVERED, value: 60, fill: COLORS[3] },
    { name: OrderStatus.CANCELLED, value: 3, fill: COLORS[4] },
    { name: OrderStatus.REFUNDED, value: 1, fill: COLORS[5] },
  ],
  this_month: [
    { name: OrderStatus.PENDING, value: 45, fill: COLORS[0] },
    { name: OrderStatus.PROCESSING, value: 55, fill: COLORS[1] },
    { name: OrderStatus.SHIPPED, value: 90, fill: COLORS[2] },
    { name: OrderStatus.DELIVERED, value: 150, fill: COLORS[3] },
    { name: OrderStatus.CANCELLED, value: 8, fill: COLORS[4] },
    { name: OrderStatus.REFUNDED, value: 4, fill: COLORS[5] },
  ],
  this_year: [
    { name: OrderStatus.PENDING, value: 300, fill: COLORS[0] },
    { name: OrderStatus.PROCESSING, value: 250, fill: COLORS[1] },
    { name: OrderStatus.SHIPPED, value: 500, fill: COLORS[2] },
    { name: OrderStatus.DELIVERED, value: 1000, fill: COLORS[3] },
    { name: OrderStatus.CANCELLED, value: 50, fill: COLORS[4] },
    { name: OrderStatus.REFUNDED, value: 20, fill: COLORS[5] },
  ],
  all_time: [
    { name: OrderStatus.PENDING, value: 1000, fill: COLORS[0] },
    { name: OrderStatus.PROCESSING, value: 800, fill: COLORS[1] },
    { name: OrderStatus.SHIPPED, value: 2000, fill: COLORS[2] },
    { name: OrderStatus.DELIVERED, value: 5000, fill: COLORS[3] },
    { name: OrderStatus.CANCELLED, value: 200, fill: COLORS[4] },
    { name: OrderStatus.REFUNDED, value: 100, fill: COLORS[5] },
  ],
};

const chartConfig = {
  orders: {
    label: "Orders",
  },
  PENDING: {
    label: "Pending",
    color: "#facc15",
  },
  PROCESSING: {
    label: "Processing",
    color: "#3b82f6",
  },
  SHIPPED: {
    label: "Shipped",
    color: "var(--chart-3)",
  },
  DELIVERED: {
    label: "Delivered",
    color: "var(--chart-4)",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "var(--chart-5)",
  },
  REFUNDED: {
    label: "Refunded",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const OrdersChart = ({ timeframe }: { timeframe: TimeframeValue }) => {
  const [chartData, setChartData] = useState(dummyOrdersData[timeframe]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      setChartData(dummyOrdersData[timeframe]);
    });
  }, [timeframe]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <CardTitle>
            <h2 className="text-2xl font-bold">Orders</h2>
          </CardTitle>
          <CardDescription>
            {TIMEFRAMES.find((t) => t.value === timeframe)?.label}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-80"
        >
          {isPending || chartData.length === 0 ? (
            <div className="bg-muted h-full w-full animate-pulse rounded-md" />
          ) : (
            <PieChart accessibilityLayer>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
              />
            </PieChart>
          )}
        </ChartContainer>
      </CardContent>

      <CardFooter className="text-muted-foreground text-sm">
        Showing orders for{" "}
        {TIMEFRAMES.find((t) => t.value === timeframe)?.label}
      </CardFooter>
    </Card>
  );
};

export default OrdersChart;
