"use client";

import { useEffect, useState, useTransition } from "react";

import { dashboardStats } from "@/lib/constants/dashboardStats";
import { TIMEFRAMES } from "@/lib/constants/timeframes";

import StatCard from "./StatCard";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface OverviewCardProps {
  metrics: DashboardMetrics;
}

const OverviewCard = ({ metrics }: OverviewCardProps) => {
  const [timeframe, setTimeframe] = useState<string>("last_30_days");
  const [stats, setStats] = useState(dashboardStats(metrics));

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      setStats(dashboardStats(metrics));
    });
  }, [metrics, timeframe]);

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
  };

  return (
    <Card className="min-h-[850px] xl:min-h-[512px]">
      <CardHeader className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <CardTitle>
            <h2 className="text-2xl font-bold">Stats</h2>
          </CardTitle>
          <CardDescription>
            {isPending
              ? "Updating..."
              : `${TIMEFRAMES.find((t) => t.value === timeframe)?.label}`}
          </CardDescription>
        </div>
        <CardAction>
          <Select value={timeframe} onValueChange={handleTimeframeChange}>
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
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isPending
          ? Array.from({ length: stats.length }).map((_, idx) => (
              <div
                key={idx}
                className="bg-muted h-50 animate-pulse rounded-md"
              />
            ))
          : stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
      </CardContent>
    </Card>
  );
};

export default OverviewCard;
