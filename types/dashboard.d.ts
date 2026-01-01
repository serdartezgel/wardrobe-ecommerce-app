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

interface SalesOverview {
  totalSales: number;
  numberOfOrders: number;
  averageOrderValue: number;
  salesByPeriod: {
    date: string;
    sales: number;
    orders: number;
  }[];
  previousPeriodComparison: {
    salesChange: number;
    ordersChange: number;
    aovChange: number;
  };
}

interface ProductPerformance {
  bestSellers: {
    productId: string;
    productName: string;
    totalRevenue: number;
    totalQuantity: number;
    orderCount: number;
  }[];
  worstPerformers: {
    productId: string;
    productName: string;
    totalRevenue: number;
    totalQuantity: number;
    orderCount: number;
  }[];
  revenueByProduct: {
    productId: string;
    productName: string;
    totalRevenue: number;
    cost: number;
    profit: number;
    profitMargin: number;
  }[];
}

interface CategoryPerformance {
  salesByCategory: {
    categoryId: string;
    categoryName: string;
    totalRevenue: number;
    totalOrders: number;
    totalQuantity: number;
    percentage: number;
  }[];
  trends: {
    categoryId: string;
    categoryName: string;
    data: {
      date: string;
      revenue: number;
    }[];
  }[];
}

interface CustomerAnalytics {
  lifetimeValue: {
    averageLTV: number;
    topCustomers: {
      userId: string;
      userName: string;
      totalSpent: number;
      orderCount: number;
    }[];
  };
  acquisitionMetrics: {
    totalCustomers: number;
    newCustomersThisPeriod: number;
    acquisitionCost: number;
  };
  repeatCustomerRate: {
    totalCustomers: number;
    repeatCustomers: number;
    rate: number;
  };
  segmentation: {
    segmentName: string;
    customerCount: number;
    averageOrderValue: number;
    totalRevenue: number;
  }[];
}

interface InventoryAnalytics {
  stockValue: {
    totalValue: number;
    byCategory: {
      categoryId: string;
      categoryName: string;
      value: number;
    }[];
  };
  turnoverRate: {
    averageRate: number;
    byProduct: {
      productId: string;
      productName: string;
      variantId: string;
      sku: string;
      stock: number;
      turnoverRate: number;
    }[];
  };
  slowMovingItems: {
    productId: string;
    productName: string;
    stock: number;
    daysSinceLastSale: number;
    stockValue: number;
  }[];
  stockOutFrequency: {
    totalStockOuts: number;
    affectedProducts: {
      productId: string;
      productName: string;
      stockOutCount: number;
      lastStockOutDate: string;
    }[];
  };
}

interface FinancialReport {
  revenueTrends: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  taxCollected: {
    total: number;
    byPeriod: {
      date: string;
      amount: number;
    }[];
  };
  shippingRevenue: {
    total: number;
    average: number;
    byPeriod: {
      date: string;
      amount: number;
    }[];
  };
  discountImpact: {
    totalDiscounts: number;
    averageDiscount: number;
    discountedOrders: number;
    percentageOfOrders: number;
    byType: {
      type: string;
      amount: number;
      orderCount: number;
    }[];
  };
}

type ReportMetric =
  | "total_sales"
  | "order_count"
  | "average_order_value"
  | "product_revenue"
  | "category_revenue"
  | "customer_count"
  | "repeat_rate"
  | "inventory_value"
  | "tax_collected"
  | "shipping_revenue"
  | "discount_amount";

interface CustomReportConfig {
  id?: string;
  name: string;
  metrics: ReportMetric[];
  startDate: Date;
  endDate: Date;
  filters: {
    categoryIds?: string[];
    brandIds?: string[];
    productIds?: string[];
    status?: string[];
  };
  groupBy?: "day" | "week" | "month" | "year";
}

interface CustomReportResult {
  config: CustomReportConfig;
  data: {
    metric: ReportMetric;
    label: string;
    value: number;
    trend?: number;
    data?: {
      date: string;
      value: number;
    }[];
  }[];
  generatedAt: Date;
}

interface ExportConfig<T> {
  format: ExportFormat;
  reportType: string;
  data: T;
  filename: string;
}
