"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import { TIMEFRAMES, TimeframeValue } from "@/lib/constants/timeframes";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";

const PRODUCT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-3)",
];

const dummyProductsData: Record<
  string,
  { name: string; value: number; fill: string }[]
> = {
  last_24_hours: [
    { name: "Oversized Hoodie", value: 18, fill: PRODUCT_COLORS[0] },
    { name: "Slim Fit Jeans", value: 15, fill: PRODUCT_COLORS[1] },
    { name: "Graphic T-Shirt", value: 12, fill: PRODUCT_COLORS[2] },
    { name: "Cargo Pants", value: 9, fill: PRODUCT_COLORS[3] },
    { name: "Puffer Jacket", value: 7, fill: PRODUCT_COLORS[4] },
  ],
  last_7_days: [
    { name: "Oversized Hoodie", value: 80, fill: PRODUCT_COLORS[0] },
    { name: "Slim Fit Jeans", value: 72, fill: PRODUCT_COLORS[1] },
    { name: "Graphic T-Shirt", value: 65, fill: PRODUCT_COLORS[2] },
    { name: "Puffer Jacket", value: 50, fill: PRODUCT_COLORS[4] },
    { name: "Cargo Pants", value: 45, fill: PRODUCT_COLORS[3] },
  ],
  last_30_days: [
    { name: "Oversized Hoodie", value: 310, fill: PRODUCT_COLORS[0] },
    { name: "Slim Fit Jeans", value: 280, fill: PRODUCT_COLORS[1] },
    { name: "Graphic T-Shirt", value: 250, fill: PRODUCT_COLORS[2] },
    { name: "Puffer Jacket", value: 220, fill: PRODUCT_COLORS[4] },
    { name: "Cargo Pants", value: 180, fill: PRODUCT_COLORS[3] },
  ],
  this_week: [
    { name: "Oversized Hoodie", value: 90, fill: PRODUCT_COLORS[0] },
    { name: "Slim Fit Jeans", value: 78, fill: PRODUCT_COLORS[1] },
    { name: "Graphic T-Shirt", value: 70, fill: PRODUCT_COLORS[2] },
    { name: "Puffer Jacket", value: 55, fill: PRODUCT_COLORS[4] },
    { name: "Cargo Pants", value: 48, fill: PRODUCT_COLORS[3] },
  ],
  this_month: [
    { name: "Oversized Hoodie", value: 350, fill: PRODUCT_COLORS[0] },
    { name: "Slim Fit Jeans", value: 310, fill: PRODUCT_COLORS[1] },
    { name: "Graphic T-Shirt", value: 275, fill: PRODUCT_COLORS[2] },
    { name: "Puffer Jacket", value: 240, fill: PRODUCT_COLORS[4] },
    { name: "Cargo Pants", value: 200, fill: PRODUCT_COLORS[3] },
  ],
  this_year: [
    { name: "Oversized Hoodie", value: 4100, fill: PRODUCT_COLORS[0] },
    { name: "Slim Fit Jeans", value: 3800, fill: PRODUCT_COLORS[1] },
    { name: "Graphic T-Shirt", value: 3500, fill: PRODUCT_COLORS[2] },
    { name: "Puffer Jacket", value: 2900, fill: PRODUCT_COLORS[4] },
    { name: "Cargo Pants", value: 2600, fill: PRODUCT_COLORS[3] },
  ],
  all_time: [
    { name: "Oversized Hoodie", value: 11000, fill: PRODUCT_COLORS[0] },
    { name: "Slim Fit Jeans", value: 9500, fill: PRODUCT_COLORS[1] },
    { name: "Graphic T-Shirt", value: 8700, fill: PRODUCT_COLORS[2] },
    { name: "Puffer Jacket", value: 7600, fill: PRODUCT_COLORS[4] },
    { name: "Cargo Pants", value: 6500, fill: PRODUCT_COLORS[3] },
  ],
};

const chartConfig = {
  value: {
    label: "Sales",
  },
} satisfies ChartConfig;

const TopSellingChart = ({ timeframe }: { timeframe: TimeframeValue }) => {
  const [chartData, setChartData] = useState(dummyProductsData[timeframe]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      setChartData(dummyProductsData[timeframe]);
    });
  }, [timeframe]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <CardTitle>
            <h2 className="text-2xl font-bold">Top Selling Products</h2>
          </CardTitle>
          <CardDescription>
            {TIMEFRAMES.find((t) => t.value === timeframe)?.label}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto max-h-80 w-full px-10"
        >
          {isPending ? (
            <div className="bg-muted h-full w-full animate-pulse rounded-md" />
          ) : (
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{ right: 20 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" dataKey="value" hide />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                hide
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar dataKey="value" radius={5} layout="vertical">
                <LabelList
                  dataKey="name"
                  position="insideLeft"
                  offset={8}
                  fontSize={14}
                  fontWeight={600}
                  fill="var(--secondary)"
                />
                <LabelList
                  dataKey="value"
                  position="right"
                  offset={4}
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          )}
        </ChartContainer>
      </CardContent>

      <CardFooter className="text-muted-foreground text-sm">
        Showing top 5 products for{" "}
        {TIMEFRAMES.find((t) => t.value === timeframe)?.label}
      </CardFooter>
    </Card>
  );
};

export default TopSellingChart;
