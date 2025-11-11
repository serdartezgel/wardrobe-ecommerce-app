interface DashboardMetrics {
  // Sales Metrics
  totalRevenue: {
    current: number;
    previous: number;
    percentChange: number;
  };
  totalOrders: {
    current: number;
    previous: number;
    percentChange: number;
  };
  averageOrderValue: {
    current: number;
    previous: number;
    percentChange: number;
  };

  // Customer Metrics
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;

  // Product Metrics
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;

  // Order Status
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;

  // Review Metrics
  pendingReviews: number;
  averageRating: number;

  // Deals & Coupons
  activeDeals: number;
  activeCoupons: number;
}
