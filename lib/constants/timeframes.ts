export type TimeframeValue =
  | "last_24_hours"
  | "last_7_days"
  | "last_30_days"
  | "this_week"
  | "this_month"
  | "this_year"
  | "all_time";

export interface TimeframeProps {
  label: string;
  value: TimeframeValue;
}

export const TIMEFRAMES: TimeframeProps[] = [
  { label: "Last 24 Hours", value: "last_24_hours" },
  { label: "Last 7 Days", value: "last_7_days" },
  { label: "Last 30 Days", value: "last_30_days" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "This Year", value: "this_year" },
  { label: "All Time", value: "all_time" },
];
