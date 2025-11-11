"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

interface SingleMetricStat {
  title: string;
  value: number | string;
  previous?: number;
  percentChange?: number;
}

interface GroupMetricStat {
  title: string;
  stats: {
    label: string;
    value: number | string;
  }[];
}

const StatCard = (stats: SingleMetricStat | GroupMetricStat) => {
  const isSingleMetric = "value" in stats;

  return (
    <Card className="min-h-52">
      <CardHeader>
        <CardTitle>
          <h3 className="text-xl font-semibold">{stats.title}</h3>
        </CardTitle>
        <Separator />
      </CardHeader>
      <CardContent>
        {isSingleMetric ? (
          <div>
            <p className="text-3xl font-bold">{stats.value}</p>
            {stats.percentChange !== undefined && (
              <p
                className={`mt-1 text-sm ${
                  stats.percentChange >= 0
                    ? "text-green-600"
                    : "text-destructive"
                }`}
              >
                {stats.percentChange}% from previous
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {stats.stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between text-sm"
              >
                <span>{stat.label}</span>
                <span className="font-semibold">{stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
