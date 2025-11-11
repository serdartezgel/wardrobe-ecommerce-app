export const dashboardStats = (metrics: DashboardMetrics) => [
  {
    title: "Total Revenue",
    value: metrics.totalRevenue.current,
    previous: metrics.totalRevenue.previous,
    percentChange: metrics.totalRevenue.percentChange,
  },
  {
    title: "Total Orders",
    value: metrics.totalOrders.current,
    previous: metrics.totalOrders.previous,
    percentChange: metrics.totalOrders.percentChange,
  },
  {
    title: "Avg. Order Value",
    value: metrics.averageOrderValue.current,
    previous: metrics.averageOrderValue.previous,
    percentChange: metrics.averageOrderValue.percentChange,
  },
  {
    title: "Customers",
    stats: [
      { label: "Total Customers", value: metrics.totalCustomers },
      { label: "New Customers", value: metrics.newCustomers },
      { label: "Returning Customers", value: metrics.returningCustomers },
    ],
  },
  {
    title: "Products",
    stats: [
      { label: "Total Products", value: metrics.totalProducts },
      { label: "Active Products", value: metrics.activeProducts },
      { label: "Low Stock", value: metrics.lowStockProducts },
      { label: "Out of Stock", value: metrics.outOfStockProducts },
    ],
  },
  {
    title: "Order Status",
    stats: [
      { label: "Pending", value: metrics.pendingOrders },
      { label: "Processing", value: metrics.processingOrders },
      { label: "Shipped", value: metrics.shippedOrders },
    ],
  },
  {
    title: "Reviews",
    stats: [
      { label: "Pending Reviews", value: metrics.pendingReviews },
      { label: "Average Rating", value: metrics.averageRating },
    ],
  },
  {
    title: "Deals & Coupons",
    stats: [
      { label: "Active Deals", value: metrics.activeDeals },
      { label: "Active Coupons", value: metrics.activeCoupons },
    ],
  },
];
