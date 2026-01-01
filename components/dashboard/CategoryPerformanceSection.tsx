"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

import { formatNumber } from "@/lib/utils/analytics";
import { formatPrice, formatPriceNumber } from "@/lib/utils/price";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  orders: {
    label: "Orders",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const CategoryPerformanceSection = ({
  data,
}: {
  data: CategoryPerformance;
}) => {
  const pieData = data.salesByCategory.map((cat) => ({
    name: cat.categoryName,
    value: formatPrice(cat.totalRevenue),
  }));

  const barData = data.salesByCategory.map((cat) => ({
    category: cat.categoryName,
    revenue: formatPriceNumber(cat.totalRevenue),
    orders: cat.totalOrders,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Distribution by Category</CardTitle>
            <CardDescription>Revenue percentage breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="mx-auto max-h-72">
              <PieChart accessibilityLayer>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
            <CardDescription>Total revenue and order count</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="mx-auto max-h-72">
              <BarChart accessibilityLayer data={barData} margin={{ top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="category" tickLine={false} axisLine={false} />
                <YAxis yAxisId="revenue" tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar
                  yAxisId="revenue"
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="orders"
                  dataKey="orders"
                  fill="var(--color-orders)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {data.trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Trends</CardTitle>
            <CardDescription>Revenue trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="max-h-80 w-full">
              <LineChart accessibilityLayer margin={{ top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                {data.trends.map((trend, index) => (
                  <Line
                    key={trend.categoryId}
                    type="monotone"
                    data={trend.data.map((d) => ({
                      date: d.date,
                      value: formatPriceNumber(d.revenue),
                    }))}
                    dataKey="value"
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    name={trend.categoryName}
                  />
                ))}
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Category Performance Summary</CardTitle>
          <CardDescription>Detailed breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.salesByCategory.map((category) => (
              <div
                key={category.categoryId}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div className="space-y-1">
                  <p className="font-medium">{category.categoryName}</p>
                  <div className="text-muted-foreground flex gap-4 text-sm">
                    <span>Orders: {formatNumber(category.totalOrders)}</span>
                    <span>Items: {formatNumber(category.totalQuantity)}</span>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <p className="font-bold">
                    {formatPrice(category.totalRevenue)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {category.percentage.toFixed(1)}% of total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryPerformanceSection;
