"use client";

import { useEffect, useState, useTransition } from "react";

import { dashboardStats } from "@/lib/constants/dashboardStats";
import { TIMEFRAMES, TimeframeValue } from "@/lib/constants/timeframes";

import StatCard from "./StatCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface OverviewCardProps {
  metrics: DashboardMetrics;
  timeframe: TimeframeValue;
}

const OverviewCard = ({ metrics, timeframe }: OverviewCardProps) => {
  const [stats, setStats] = useState(dashboardStats(metrics));

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      setStats(dashboardStats(metrics));
    });
  }, [metrics, timeframe]);

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
