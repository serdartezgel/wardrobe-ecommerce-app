import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";

import { formatNumber, formatPercentage } from "@/lib/utils/analytics";
import { formatPrice } from "@/lib/utils/price";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface AnalyticsStatsCardProps {
  title: string;
  value: number;
  type: "currency" | "number" | "percentage";
  change?: number;
  icon?: React.ReactNode;
  description?: string;
}

const AnalyticsStatsCard = ({
  title,
  value,
  type,
  change,
  icon,
  description,
}: AnalyticsStatsCardProps) => {
  const formatValue = () => {
    switch (type) {
      case "currency":
        return formatPrice(value);
      case "percentage":
        return formatPercentage(value);
      case "number":
        return formatNumber(value);
      default:
        return value.toString();
    }
  };

  const getTrendIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <ArrowUpIcon className="h-4 w-4 text-green-600" />;
    if (change < 0) return <ArrowDownIcon className="h-4 w-4 text-red-600" />;
    return <MinusIcon className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (change === undefined) return "";
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-400";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue()}</div>
        {change !== undefined && (
          <div className="mt-1 flex items-center gap-1 text-xs">
            {getTrendIcon()}
            <span className={getTrendColor()}>
              {Math.abs(change).toFixed(1)}% vs previous period
            </span>
          </div>
        )}
        {description && (
          <p className="text-muted-foreground mt-2 text-xs">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsStatsCard;
