"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TIMEFRAMES, TimeframeValue } from "@/lib/constants/timeframes";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";

const dummyRevenueData: Record<
  string,
  { category: string; revenue: number; fill: string }[]
> = {
  last_24_hours: [
    { category: "men", revenue: 275, fill: "var(--chart-5)" },
    { category: "women", revenue: 200, fill: "var(--chart-2)" },
    { category: "kids", revenue: 287, fill: "var(--chart-1)" },
  ],
  last_7_days: [
    { category: "men", revenue: 21900, fill: "var(--chart-5)" },
    { category: "women", revenue: 27800, fill: "var(--chart-2)" },
    { category: "kids", revenue: 9900, fill: "var(--chart-1)" },
  ],
  last_30_days: [
    { category: "men", revenue: 88500, fill: "var(--chart-5)" },
    { category: "women", revenue: 111000, fill: "var(--chart-2)" },
    { category: "kids", revenue: 41000, fill: "var(--chart-1)" },
  ],
  this_week: [
    { category: "men", revenue: 26800, fill: "var(--chart-5)" },
    { category: "women", revenue: 32600, fill: "var(--chart-2)" },
    { category: "kids", revenue: 10400, fill: "var(--chart-1)" },
  ],
  this_month: [
    { category: "men", revenue: 113000, fill: "var(--chart-5)" },
    { category: "women", revenue: 145000, fill: "var(--chart-2)" },
    { category: "kids", revenue: 52000, fill: "var(--chart-1)" },
  ],
  this_year: [
    { category: "men", revenue: 1060000, fill: "var(--chart-5)" },
    { category: "women", revenue: 1420000, fill: "var(--chart-2)" },
    { category: "kids", revenue: 492000, fill: "var(--chart-1)" },
  ],
  all_time: [
    { category: "men", revenue: 4037000, fill: "var(--chart-5)" },
    { category: "women", revenue: 4570000, fill: "var(--chart-2)" },
    { category: "kids", revenue: 1850000, fill: "var(--chart-1)" },
  ],
};

const chartConfig = {
  revenue: {
    label: "Revenue",
  },
  men: { label: "Men" },
  women: { label: "Women" },
  kids: { label: "Kids" },
} satisfies ChartConfig;

const CategoryRevenueChart = ({ timeframe }: { timeframe: TimeframeValue }) => {
  const [chartData, setChartData] = useState(dummyRevenueData[timeframe]);
  const [isPending, startTransition] = useTransition();

  const totalRevenue = useMemo(() => {
    return dummyRevenueData[timeframe].reduce(
      (acc, curr) => acc + curr.revenue,
      0,
    );
  }, [timeframe]);

  useEffect(() => {
    startTransition(() => {
      setChartData(dummyRevenueData[timeframe]);
    });
  }, [timeframe]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <CardTitle>
            <h2 className="text-2xl font-bold">Revenue By Category</h2>
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
          {isPending ? (
            <div className="bg-muted h-full w-full animate-pulse rounded-md" />
          ) : (
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="revenue"
                nameKey="category"
                innerRadius={75}
                strokeWidth={10}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalRevenue.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Total Revenue
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="category" />}
                className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
              />
            </PieChart>
          )}
        </ChartContainer>
      </CardContent>

      <CardFooter className="text-muted-foreground text-sm">
        Showing revenue by category for{" "}
        {TIMEFRAMES.find((t) => t.value === timeframe)?.label}
      </CardFooter>
    </Card>
  );
};

export default CategoryRevenueChart;
