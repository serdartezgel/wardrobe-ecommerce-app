import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "../animate-ui/components/animate/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

const RecentActivities = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="text-2xl font-bold">Recent Activities</h2>
        </CardTitle>
        <CardDescription>Recent activities on your shop</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={"recentOrders"}>
          <TabsList>
            <TabsTrigger value="recentOrders">Recent Orders</TabsTrigger>
            <TabsTrigger value="lowStock">Low Stocks</TabsTrigger>
            <TabsTrigger value="newCustomer">New Customers</TabsTrigger>
            <TabsTrigger value="pendingReviews">Pending Reviews</TabsTrigger>
          </TabsList>
          <TabsContents className="bg-background dark:border-input dark:bg-input/30 rounded-md border border-transparent p-3 shadow-sm">
            <TabsContent value="recentOrders">Recent orders list</TabsContent>
            <TabsContent value="lowStock">Low stock alerts</TabsContent>
            <TabsContent value="newCustomer">
              New customer registrations
            </TabsContent>
            <TabsContent value="pendingReviews">Pending Reviews</TabsContent>
          </TabsContents>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
