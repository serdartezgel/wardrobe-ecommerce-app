import { Suspense } from "react";

import { InventoryOverview } from "@/components/charts/InventoryReview";
import { BulkAdjustmentForm } from "@/components/dashboard/BulkAdjustmentForm";
import { LowStockAlert } from "@/components/dashboard/LowStockAlert";
import { OutOfStockAlert } from "@/components/dashboard/OutOfStockAlert";
import InventoryLogsTable from "@/components/tables/InventoryLogsTable";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/ui/animate-ui/components/animate/tabs";
import { getInventoryLogs } from "@/lib/actions/inventory.action";
import { InventoryLogWithRelations } from "@/types/prisma";

const InventoryPage = async () => {
  const result = await getInventoryLogs({});

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage your product inventory
          </p>
        </div>
      </header>

      <Suspense fallback={<div>Loading...</div>}>
        <InventoryOverview />
      </Suspense>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Inventory Logs</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
          <TabsTrigger value="bulk-adjust">Bulk Adjustment</TabsTrigger>
        </TabsList>

        <TabsContents>
          <TabsContent value="logs">
            <Suspense fallback={<div>Loading...</div>}>
              <InventoryLogsTable
                logs={result.data?.logs as InventoryLogWithRelations[]}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="low-stock">
            <Suspense fallback={<div>Loading...</div>}>
              <LowStockAlert />
            </Suspense>
          </TabsContent>

          <TabsContent value="out-of-stock">
            <Suspense fallback={<div>Loading...</div>}>
              <OutOfStockAlert />
            </Suspense>
          </TabsContent>

          <TabsContent value="bulk-adjust">
            <BulkAdjustmentForm />
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  );
};

export default InventoryPage;
