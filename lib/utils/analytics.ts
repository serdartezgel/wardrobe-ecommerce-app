import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subHours,
} from "date-fns";

import { TimeframeValue } from "../constants/timeframes";

export function getDateRangeFromTimeframe(timeframe: TimeframeValue): {
  startDate: Date;
  endDate: Date;
} {
  const now = new Date();

  switch (timeframe) {
    case "last_24_hours":
      return {
        startDate: subHours(now, 24),
        endDate: now,
      };
    case "last_7_days":
      return {
        startDate: subDays(startOfDay(now), 6),
        endDate: endOfDay(now),
      };
    case "last_30_days":
      return {
        startDate: subDays(startOfDay(now), 29),
        endDate: endOfDay(now),
      };
    case "this_week":
      return {
        startDate: startOfWeek(now, { weekStartsOn: 1 }),
        endDate: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case "this_month":
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
      };
    case "this_year":
      return {
        startDate: startOfYear(now),
        endDate: endOfYear(now),
      };
    case "all_time":
      return {
        startDate: new Date(2020, 0, 1),
        endDate: now,
      };
    default:
      return {
        startDate: subDays(startOfDay(now), 29),
        endDate: endOfDay(now),
      };
  }
}

export function calculatePercentageChange(
  current: number,
  previous: number,
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function groupByPeriod<T>(
  data: T[],
  dateField: keyof T,
  period: "day" | "week" | "month" | "year",
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  data.forEach((item) => {
    const date = item[dateField] as unknown as Date;
    let key: string;

    switch (period) {
      case "day":
        key = startOfDay(date).toISOString();
        break;
      case "week":
        key = startOfWeek(date, { weekStartsOn: 1 }).toISOString();
        break;
      case "month":
        key = startOfMonth(date).toISOString();
        break;
      case "year":
        key = startOfYear(date).toISOString();
        break;
    }

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(item);
  });

  return grouped;
}
