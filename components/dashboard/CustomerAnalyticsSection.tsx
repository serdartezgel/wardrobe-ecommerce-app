"use client";

import { RepeatIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";

import { formatNumber } from "@/lib/utils/analytics";
import { formatPrice } from "@/lib/utils/price";

import AnalyticsStatsCard from "../cards/AnalyticsStatsCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const SEGMENT_COLORS = {
  "High Value (>$1000)": "#10b981",
  "Medium Value ($500-$1000)": "#f59e0b",
  "Low Value (<$500)": "#ef4444",
};

const chartConfig = {
  customers: {
    label: "Customers",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const CustomerAnalyticsSection = ({ data }: { data: CustomerAnalytics }) => {
  const segmentChartData = data.segmentation.map((seg) => ({
    name: seg.segmentName,
    customers: seg.customerCount,
    revenue: formatPrice(seg.totalRevenue),
    aov: formatPrice(seg.averageOrderValue),
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <AnalyticsStatsCard
          title="Average Customer LTV"
          value={data.lifetimeValue.averageLTV}
          type="currency"
          icon={<UsersIcon className="h-4 w-4" />}
          description="Average lifetime value per customer"
        />
        <AnalyticsStatsCard
          title="New Customers"
          value={data.acquisitionMetrics.newCustomersThisPeriod}
          type="number"
          icon={<UserPlusIcon className="h-4 w-4" />}
          description="Acquired in this period"
        />
        <AnalyticsStatsCard
          title="Repeat Customer Rate"
          value={data.repeatCustomerRate.rate}
          type="percentage"
          icon={<RepeatIcon className="h-4 w-4" />}
          description={`${formatNumber(data.repeatCustomerRate.repeatCustomers)} of ${formatNumber(data.repeatCustomerRate.totalCustomers)} customers`}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Customers by Lifetime Value</CardTitle>
            <CardDescription>Your most valuable customers</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.lifetimeValue.topCustomers.map((customer) => (
                  <TableRow key={customer.userId}>
                    <TableCell className="font-medium">
                      {customer.userName}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(customer.totalSpent)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(customer.orderCount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Segmentation</CardTitle>
            <CardDescription>Distribution by spending level</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="max-h-72 w-full">
              <BarChart
                accessibilityLayer
                data={segmentChartData}
                margin={{ top: 8 }}
              >
                <CartesianGrid vertical={false} />

                <XAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tickMargin={8}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                />

                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatNumber(Number(value))}
                    />
                  }
                />

                <Bar dataKey="customers" radius={[4, 4, 0, 0]}>
                  {segmentChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        SEGMENT_COLORS[
                          entry.name as keyof typeof SEGMENT_COLORS
                        ] ?? "var(--chart-1)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Segment Details</CardTitle>
          <CardDescription>
            Performance metrics by customer segment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.segmentation.map((segment) => (
              <div
                key={segment.segmentName}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          SEGMENT_COLORS[
                            segment.segmentName as keyof typeof SEGMENT_COLORS
                          ],
                      }}
                    />
                    <p className="font-medium">{segment.segmentName}</p>
                  </div>
                  <div className="text-muted-foreground flex gap-4 text-sm">
                    <span>
                      Customers: {formatNumber(segment.customerCount)}
                    </span>
                    <span>
                      Avg Order Value: {formatPrice(segment.averageOrderValue)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    {formatPrice(segment.totalRevenue)}
                  </p>
                  <p className="text-muted-foreground text-sm">Total Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerAnalyticsSection;
