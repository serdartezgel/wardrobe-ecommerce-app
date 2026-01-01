import OverviewCard from "@/components/cards/OverviewCard";
import RecentActivities from "@/components/cards/RecentActivities";
import CategoryRevenueChart from "@/components/charts/CategoryRevenueChart";
import CustomerGrowthChart from "@/components/charts/CustomerGrowthChart";
import InventoryStatusChart from "@/components/charts/InventoryStatusChart";
import OrdersChart from "@/components/charts/OrdersChart";
import SalesChart from "@/components/charts/SalesChart";
import TopSellingChart from "@/components/charts/TopSellingChart";
import TimeframeSelector from "@/components/common/TimeframeSelector";
import { TimeframeValue } from "@/lib/constants/timeframes";

const DUMMY_DASHBOARD_METRICS: DashboardMetrics = {
  // Sales Metrics
  totalRevenue: {
    current: 42380,
    previous: 37750,
    percentChange: 12.3,
  },
  totalOrders: {
    current: 1284,
    previous: 1325,
    percentChange: -3.1,
  },
  averageOrderValue: {
    current: 33.0,
    previous: 28.5,
    percentChange: 15.8,
  },

  // Customer Metrics
  totalCustomers: 460,
  newCustomers: 342,
  returningCustomers: 118,

  // Product Metrics
  totalProducts: 128,
  activeProducts: 110,
  lowStockProducts: 12,
  outOfStockProducts: 6,

  // Order Status
  pendingOrders: 23,
  processingOrders: 15,
  shippedOrders: 1246,

  // Review Metrics
  pendingReviews: 7,
  averageRating: 4.3,

  // Deals & Coupons
  activeDeals: 5,
  activeCoupons: 12,
};

const DashboardPage = async ({ searchParams }: RouteParams) => {
  const params = await searchParams;
  const timeframe = (params.timeframe as TimeframeValue) || "last_30_days";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s an overview of your shop.
          </p>
        </div>

        <div className="fixed right-6">
          <TimeframeSelector route="/dashboard" />
        </div>
      </header>

      <OverviewCard metrics={DUMMY_DASHBOARD_METRICS} timeframe={timeframe} />

      <div className="grid grid-cols-1 gap-x-4 gap-y-6 lg:grid-cols-2">
        <SalesChart timeframe={timeframe} />
        <OrdersChart timeframe={timeframe} />
        <TopSellingChart timeframe={timeframe} />
        <CategoryRevenueChart timeframe={timeframe} />
        <CustomerGrowthChart timeframe={timeframe} />
        <InventoryStatusChart timeframe={timeframe} />
      </div>

      <RecentActivities />
    </div>
  );
};

export default DashboardPage;
