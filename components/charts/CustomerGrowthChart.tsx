"use client";

import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

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

const dummyCustomerGrowth: Record<
  string,
  {
    date: string;
    newCustomers: number;
    returningCustomers: number;
    totalCustomers: number;
  }[]
> = {
  last_24_hours: [
    {
      date: "00:00",
      newCustomers: 5,
      returningCustomers: 3,
      totalCustomers: 8,
    },
    {
      date: "04:00",
      newCustomers: 8,
      returningCustomers: 5,
      totalCustomers: 13,
    },
    {
      date: "08:00",
      newCustomers: 12,
      returningCustomers: 7,
      totalCustomers: 19,
    },
    {
      date: "12:00",
      newCustomers: 15,
      returningCustomers: 10,
      totalCustomers: 25,
    },
    {
      date: "16:00",
      newCustomers: 10,
      returningCustomers: 8,
      totalCustomers: 18,
    },
    {
      date: "20:00",
      newCustomers: 18,
      returningCustomers: 12,
      totalCustomers: 30,
    },
  ],

  last_7_days: [
    {
      date: "Mon",
      newCustomers: 12,
      returningCustomers: 8,
      totalCustomers: 20,
    },
    {
      date: "Tue",
      newCustomers: 20,
      returningCustomers: 12,
      totalCustomers: 32,
    },
    {
      date: "Wed",
      newCustomers: 15,
      returningCustomers: 10,
      totalCustomers: 25,
    },
    {
      date: "Thu",
      newCustomers: 25,
      returningCustomers: 15,
      totalCustomers: 40,
    },
    {
      date: "Fri",
      newCustomers: 18,
      returningCustomers: 20,
      totalCustomers: 38,
    },
    {
      date: "Sat",
      newCustomers: 30,
      returningCustomers: 22,
      totalCustomers: 52,
    },
    {
      date: "Sun",
      newCustomers: 35,
      returningCustomers: 25,
      totalCustomers: 60,
    },
  ],

  last_30_days: Array.from({ length: 30 }).map((_, i) => {
    const newC = Math.floor(Math.random() * 50) + 5;
    const returningC = Math.floor(Math.random() * 40) + 5;
    return {
      date: `${i + 1}`,
      newCustomers: newC,
      returningCustomers: returningC,
      totalCustomers: newC + returningC,
    };
  }),

  this_week: [
    {
      date: "Mon",
      newCustomers: 10,
      returningCustomers: 8,
      totalCustomers: 18,
    },
    {
      date: "Tue",
      newCustomers: 18,
      returningCustomers: 12,
      totalCustomers: 30,
    },
    {
      date: "Wed",
      newCustomers: 12,
      returningCustomers: 10,
      totalCustomers: 22,
    },
    {
      date: "Thu",
      newCustomers: 20,
      returningCustomers: 15,
      totalCustomers: 35,
    },
    {
      date: "Fri",
      newCustomers: 15,
      returningCustomers: 12,
      totalCustomers: 27,
    },
    {
      date: "Sat",
      newCustomers: 22,
      returningCustomers: 18,
      totalCustomers: 40,
    },
    {
      date: "Sun",
      newCustomers: 25,
      returningCustomers: 20,
      totalCustomers: 45,
    },
  ],

  this_month: Array.from({ length: 30 }).map((_, i) => {
    const newC = Math.floor(Math.random() * 60) + 10;
    const returningC = Math.floor(Math.random() * 50) + 5;
    return {
      date: `${i + 1}`,
      newCustomers: newC,
      returningCustomers: returningC,
      totalCustomers: newC + returningC,
    };
  }),

  this_year: Array.from({ length: 12 }).map((_, i) => {
    const newC = Math.floor(Math.random() * 500) + 50;
    const returningC = Math.floor(Math.random() * 400) + 50;
    return {
      date: new Date(0, i).toLocaleString("default", { month: "short" }),
      newCustomers: newC,
      returningCustomers: returningC,
      totalCustomers: newC + returningC,
    };
  }),

  all_time: Array.from({ length: 12 }).map((_, i) => {
    const newC = Math.floor(Math.random() * 1000) + 100;
    const returningC = Math.floor(Math.random() * 800) + 50;
    return {
      date: new Date(0, i).toLocaleString("default", { month: "short" }),
      newCustomers: newC,
      returningCustomers: returningC,
      totalCustomers: newC + returningC,
    };
  }),
};

const chartConfig = {
  newCustomers: {
    label: "New Customers",
    color: "var(--chart-1)",
  },
  returningCustomers: {
    label: "Returning Customers",
    color: "var(--chart-2)",
  },
  totalCustomers: {
    label: "Total Customers",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const CustomerGrowthChart = ({ timeframe }: { timeframe: TimeframeValue }) => {
  const [chartData, setChartData] = useState(dummyCustomerGrowth[timeframe]);
  const [isPending, startTransition] = useTransition();

  const [percentChange, setPercentChange] = useState<string | null>(null);
  const [isUp, setIsUp] = useState<boolean | null>(null);

  useEffect(() => {
    startTransition(() => {
      setChartData(dummyCustomerGrowth[timeframe]);
    });
  }, [timeframe]);

  useEffect(() => {
    if (chartData.length > 1) {
      const first = chartData[0].totalCustomers;
      const last = chartData[chartData.length - 1].totalCustomers;
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
            <h2 className="text-2xl font-bold">Customer Growth</h2>
          </CardTitle>
          <CardDescription>
            {TIMEFRAMES.find((t) => t.value === timeframe)?.label}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto max-h-80">
          {isPending || chartData.length === 0 ? (
            <div className="bg-muted h-full w-full animate-pulse rounded-md" />
          ) : (
            <AreaChart
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
                dataKey="date"
                type="category"
                tickLine={false}
                axisLine={false}
                interval={0}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <defs>
                <linearGradient id="fillNew" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-newCustomers)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-newCustomers)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillReturning" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-returningCustomers)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-returningCustomers)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-totalCustomers)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-totalCustomers)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey={"newCustomers"}
                type={"monotone"}
                fill="url(#fillNew)"
                fillOpacity={0.4}
                stroke="var(--color-newCustomers"
                stackId="a"
              />
              <Area
                dataKey={"returningCustomers"}
                type={"monotone"}
                fill="url(#fillReturning)"
                fillOpacity={0.4}
                stroke="var(--color-returningCustomers"
                stackId="a"
              />
              <Area
                dataKey={"totalCustomers"}
                type={"monotone"}
                fill="url(#fillTotal)"
                fillOpacity={0.4}
                stroke="var(--color-totalCustomers"
                stackId="a"
              />
            </AreaChart>
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
              Showing total customers for{" "}
              {TIMEFRAMES.find((t) => t.value === timeframe)?.label}
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default CustomerGrowthChart;
