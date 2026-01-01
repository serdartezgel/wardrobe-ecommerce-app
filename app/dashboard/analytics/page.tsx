import { DownloadIcon, FileSpreadsheetIcon } from "lucide-react";
import { Suspense } from "react";

import TimeframeSelector from "@/components/common/TimeframeSelector";
import CategoryPerformanceSection from "@/components/dashboard/CategoryPerformanceSection";
import CustomerAnalyticsSection from "@/components/dashboard/CustomerAnalyticsSection";
import FinancialReportSection from "@/components/dashboard/FinancialReportSection";
import InventoryAnalyticsSection from "@/components/dashboard/InventoryAnalyticsSection";
import ProductPerformanceSection from "@/components/dashboard/ProductPerformanceSection";
import SalesOverviewSection from "@/components/dashboard/SalesOverviewSection";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/ui/animate-ui/components/animate/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCategoryPerformance,
  getCustomerAnalytics,
  getFinancialReport,
  getInventoryAnalytics,
  getProductPerformance,
  getSalesOverview,
} from "@/lib/actions/analytics.action";
import { TimeframeValue } from "@/lib/constants/timeframes";

const DashboardAnalyticsPage = async ({ searchParams }: RouteParams) => {
  const params = await searchParams;
  const timeframe = (params.timeframe as TimeframeValue) || "last_30_days";
  const currentTab = params.tab || "overview";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive business insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TimeframeSelector route="/dashboard/analytics" />
          <Button variant="outline" size="sm">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </header>

      <Tabs defaultValue={currentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContents>
          <TabsContent value="overview" className="space-y-4">
            <Suspense
              fallback={
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Loading sales overview...
                    </p>
                  </CardContent>
                </Card>
              }
            >
              <SalesOverviewData timeframe={timeframe} />
            </Suspense>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Suspense
              fallback={
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Loading product performance...
                    </p>
                  </CardContent>
                </Card>
              }
            >
              <ProductPerformanceData timeframe={timeframe} />
            </Suspense>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Suspense
              fallback={
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Loading category performance...
                    </p>
                  </CardContent>
                </Card>
              }
            >
              <CategoryPerformanceData timeframe={timeframe} />
            </Suspense>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <Suspense
              fallback={
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Loading customer analytics...
                    </p>
                  </CardContent>
                </Card>
              }
            >
              <CustomerAnalyticsData timeframe={timeframe} />
            </Suspense>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Suspense
              fallback={
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Loading inventory analytics...
                    </p>
                  </CardContent>
                </Card>
              }
            >
              <InventoryAnalyticsData />
            </Suspense>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <Suspense
              fallback={
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Loading financial report...
                    </p>
                  </CardContent>
                </Card>
              }
            >
              <FinancialReportData timeframe={timeframe} />
            </Suspense>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <Card>
              <CardContent className="py-12">
                <div className="space-y-4 text-center">
                  <FileSpreadsheetIcon className="text-muted-foreground mx-auto h-12 w-12" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      Custom Report Builder
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      Create custom reports with specific metrics and filters
                    </p>
                  </div>
                  <Button>Create Custom Report</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  );
};

async function SalesOverviewData({ timeframe }: { timeframe: TimeframeValue }) {
  const result = await getSalesOverview(timeframe);
  if (!result.success || !result.data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-red-600">
          Failed to load sales overview data
        </CardContent>
      </Card>
    );
  }
  return <SalesOverviewSection data={result.data} />;
}

async function ProductPerformanceData({
  timeframe,
}: {
  timeframe: TimeframeValue;
}) {
  const result = await getProductPerformance(timeframe);
  if (!result.success || !result.data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-red-600">
          Failed to load product performance data
        </CardContent>
      </Card>
    );
  }
  return <ProductPerformanceSection data={result.data} />;
}

async function CategoryPerformanceData({
  timeframe,
}: {
  timeframe: TimeframeValue;
}) {
  const result = await getCategoryPerformance(timeframe);
  if (!result.success || !result.data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-red-600">
          Failed to load category performance data
        </CardContent>
      </Card>
    );
  }
  return <CategoryPerformanceSection data={result.data} />;
}

async function CustomerAnalyticsData({
  timeframe,
}: {
  timeframe: TimeframeValue;
}) {
  const result = await getCustomerAnalytics(timeframe);
  if (!result.success || !result.data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-red-600">
          Failed to load customer analytics data
        </CardContent>
      </Card>
    );
  }
  return <CustomerAnalyticsSection data={result.data} />;
}

async function InventoryAnalyticsData() {
  const result = await getInventoryAnalytics();
  if (!result.success || !result.data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-red-600">
          Failed to load inventory analytics data
        </CardContent>
      </Card>
    );
  }
  return <InventoryAnalyticsSection data={result.data} />;
}

async function FinancialReportData({
  timeframe,
}: {
  timeframe: TimeframeValue;
}) {
  const result = await getFinancialReport(timeframe);
  if (!result.success || !result.data) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-red-600">
          Failed to load financial report data
        </CardContent>
      </Card>
    );
  }
  return <FinancialReportSection data={result.data} />;
}

export default DashboardAnalyticsPage;
