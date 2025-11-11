"use client";

import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { TIMEFRAMES } from "@/lib/constants/timeframes";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardAction,
  CardFooter,
} from "../ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "../ui/select";

const dummyData: Record<string, { month: string; sales: number }[]> = {
  last_24_hours: [
    { month: "00:00", sales: 5 },
    { month: "04:00", sales: 8 },
    { month: "08:00", sales: 12 },
    { month: "12:00", sales: 15 },
    { month: "16:00", sales: 10 },
    { month: "20:00", sales: 18 },
  ],
  last_7_days: [
    { month: "Mon", sales: 50 },
    { month: "Tue", sales: 75 },
    { month: "Wed", sales: 60 },
    { month: "Thu", sales: 90 },
    { month: "Fri", sales: 100 },
    { month: "Sat", sales: 120 },
    { month: "Sun", sales: 80 },
  ],
  last_30_days: Array.from({ length: 30 }).map((_, i) => ({
    month: `${i + 1}`,
    sales: Math.floor(Math.random() * 200) + 20,
  })),
  this_week: [
    { month: "Mon", sales: 40 },
    { month: "Tue", sales: 70 },
    { month: "Wed", sales: 50 },
    { month: "Thu", sales: 90 },
    { month: "Fri", sales: 110 },
    { month: "Sat", sales: 80 },
    { month: "Sun", sales: 60 },
  ],
  this_month: Array.from({ length: 30 }).map((_, i) => ({
    month: `${i + 1}`,
    sales: Math.floor(Math.random() * 150) + 30,
  })),
  this_year: Array.from({ length: 12 }).map((_, i) => ({
    month: new Date(0, i).toLocaleString("default", { month: "short" }),
    sales: Math.floor(Math.random() * 2000) + 500,
  })),
  all_time: Array.from({ length: 12 }).map((_, i) => ({
    month: new Date(0, i).toLocaleString("default", { month: "short" }),
    sales: Math.floor(Math.random() * 5000) + 1000,
  })),
};

const chartConfig = {
  sales: {
    label: "Sales",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const SalesChart = () => {
  const [timeframe, setTimeframe] = useState<string>("last_30_days");
  const [chartData, setChartData] = useState(dummyData[timeframe]);
  const [isPending, startTransition] = useTransition();

  const [percentChange, setPercentChange] = useState<string | null>(null);
  const [isUp, setIsUp] = useState<boolean | null>(null);

  useEffect(() => {
    startTransition(() => {
      setChartData(dummyData[timeframe]);
    });
  }, [timeframe]);

  useEffect(() => {
    if (chartData.length > 1) {
      const first = chartData[0].sales;
      const last = chartData[chartData.length - 1].sales;
      const change = last - first;
      setPercentChange(((change / first) * 100).toFixed(1));
      setIsUp(change >= 0);
    }
  }, [chartData]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <CardTitle>
            <h2 className="text-2xl font-bold">Sales</h2>
          </CardTitle>
          <CardDescription>
            {TIMEFRAMES.find((t) => t.value === timeframe)?.label}
          </CardDescription>
        </div>
        <CardAction>
          <Select
            value={timeframe}
            onValueChange={(value) => setTimeframe(value)}
          >
            <SelectTrigger className="no-focus">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Timeframe</SelectLabel>
                {TIMEFRAMES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto max-h-80">
          {isPending || chartData.length === 0 ? (
            <div className="bg-muted h-full w-full animate-pulse rounded-md" />
          ) : (
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 10,
                right: 10,
                top: 8,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                type="category"
                tickLine={false}
                axisLine={false}
                interval={0}
                tickMargin={8}
                padding={{ left: 10, right: 10 }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="sales"
                type="monotone"
                stroke="var(--color-sales)"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          )}
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {percentChange !== null && isUp !== null && (
          <>
            <div
              className={`flex gap-2 leading-none font-medium ${
                isUp ? "text-green-600" : "text-red-600"
              }`}
            >
              {`Trending ${isUp ? "up" : "down"} by ${Math.abs(
                Number(percentChange),
              )}% `}
              {isUp ? (
                <TrendingUpIcon className="h-4 w-4" />
              ) : (
                <TrendingDownIcon className="h-4 w-4" />
              )}
            </div>
            <div className="text-muted-foreground leading-none">
              Showing total sales for{" "}
              {TIMEFRAMES.find((t) => t.value === timeframe)?.label}
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default SalesChart;
