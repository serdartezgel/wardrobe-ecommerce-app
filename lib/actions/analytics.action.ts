"use server";

import { format } from "date-fns";

import { TimeframeValue } from "../constants/timeframes";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { UnauthorizedError } from "../http-errors";
import {
  calculatePercentageChange,
  getDateRangeFromTimeframe,
  groupByPeriod,
} from "../utils/analytics";

export async function getSalesOverview(
  timeframe: TimeframeValue,
): Promise<ActionResponse<SalesOverview>> {
  const validationResult = await action({
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { prisma, session } = validationResult;

  if (session?.user.role !== "ADMIN" && session?.user.role !== "SUPER_ADMIN") {
    throw new UnauthorizedError();
  }

  try {
    const { startDate, endDate } = getDateRangeFromTimeframe(timeframe);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          notIn: ["CANCELLED", "REFUNDED"],
        },
      },
      select: {
        totalCents: true,
        createdAt: true,
      },
    });

    const totalSales = orders.reduce((sum, o) => sum + o.totalCents, 0);
    const numberOfOrders = orders.length;
    const averageOrderValue =
      numberOfOrders > 0 ? totalSales / numberOfOrders : 0;

    const grouped = groupByPeriod(orders, "createdAt", "day");
    const salesByPeriod = Array.from(grouped.entries()).map(
      ([date, orders]) => ({
        date: format(new Date(date), "MMM dd"),
        sales: orders.reduce((sum, o) => sum + o.totalCents, 0),
        orders: orders.length,
      }),
    );

    const previousStart = new Date(
      startDate.getTime() - (endDate.getTime() - startDate.getTime()),
    );
    const previousOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: previousStart,
          lt: startDate,
        },
        status: {
          notIn: ["CANCELLED", "REFUNDED"],
        },
      },
      select: {
        totalCents: true,
      },
    });

    const previousSales = previousOrders.reduce(
      (sum, o) => sum + o.totalCents,
      0,
    );
    const previousOrderCount = previousOrders.length;
    const previousAOV =
      previousOrderCount > 0 ? previousSales / previousOrderCount : 0;

    const result: SalesOverview = {
      totalSales,
      numberOfOrders,
      averageOrderValue,
      salesByPeriod,
      previousPeriodComparison: {
        salesChange: calculatePercentageChange(totalSales, previousSales),
        ordersChange: calculatePercentageChange(
          numberOfOrders,
          previousOrderCount,
        ),
        aovChange: calculatePercentageChange(averageOrderValue, previousAOV),
      },
    };

    return { success: true, data: result };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getProductPerformance(
  timeframe: TimeframeValue,
  limit: number = 10,
): Promise<ActionResponse<ProductPerformance>> {
  const validationResult = await action({
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { prisma, session } = validationResult;

  if (session?.user.role !== "ADMIN" && session?.user.role !== "SUPER_ADMIN") {
    throw new UnauthorizedError();
  }

  try {
    const { startDate, endDate } = getDateRangeFromTimeframe(timeframe);

    const productStats = await prisma.orderItem.groupBy({
      by: ["productVariantId"],
      where: {
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            notIn: ["CANCELLED", "REFUNDED"],
          },
        },
      },
      _sum: {
        quantity: true,
        subtotalCents: true,
      },
      _count: {
        orderId: true,
      },
    });

    const variantIds = productStats.map((s) => s.productVariantId);
    const variants = await prisma.productVariant.findMany({
      where: {
        id: {
          in: variantIds,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            basePriceCents: true,
          },
        },
      },
    });

    const productMap = new Map(
      variants.map((v) => [
        v.id,
        {
          productId: v.product.id,
          productName: v.product.name,
          cost: v.product.basePriceCents * 0.6,
        },
      ]),
    );

    const performanceData = productStats
      .map((stat) => {
        const product = productMap.get(stat.productVariantId);
        if (!product) return null;

        const revenue = stat._sum.subtotalCents || 0;
        const quantity = stat._sum.quantity || 0;
        const cost = product.cost * quantity;
        const profit = revenue - cost;
        const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
          productId: product.productId,
          productName: product.productName,
          totalRevenue: revenue,
          totalQuantity: quantity,
          orderCount: stat._count.orderId,
          cost,
          profit,
          profitMargin,
        };
      })
      .filter((p) => p !== null);

    const sortedByRevenue = [...performanceData].sort(
      (a, b) => b.totalRevenue - a.totalRevenue,
    );

    const result: ProductPerformance = {
      bestSellers: sortedByRevenue.slice(0, limit),
      worstPerformers: sortedByRevenue.slice(-limit).reverse(),
      revenueByProduct: sortedByRevenue,
    };

    return { success: true, data: result };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getCategoryPerformance(
  timeframe: TimeframeValue,
): Promise<ActionResponse<CategoryPerformance>> {
  const validationResult = await action({
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { prisma, session } = validationResult;

  if (session?.user.role !== "ADMIN" && session?.user.role !== "SUPER_ADMIN") {
    throw new UnauthorizedError();
  }

  try {
    const { startDate, endDate } = getDateRangeFromTimeframe(timeframe);

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      include: {
        products: {
          include: {
            variants: {
              include: {
                orderItems: {
                  where: {
                    order: {
                      createdAt: {
                        gte: startDate,
                        lte: endDate,
                      },
                      status: {
                        notIn: ["CANCELLED", "REFUNDED"],
                      },
                    },
                  },
                  include: {
                    order: {
                      select: {
                        createdAt: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const leafCategoryIds = new Set(
      categories.map((c) => c.parentId).filter(Boolean),
    );

    const leafCategories = categories.filter(
      (category) => !leafCategoryIds.has(category.id),
    );

    let totalRevenue = 0;
    const categoryStats = leafCategories.map((category) => {
      const revenue = category.products.reduce((catSum, product) => {
        return (
          catSum +
          product.variants.reduce((varSum, variant) => {
            return (
              varSum +
              variant.orderItems.reduce(
                (itemSum, item) => itemSum + item.subtotalCents,
                0,
              )
            );
          }, 0)
        );
      }, 0);

      totalRevenue += revenue;

      const orders = new Set(
        category.products.flatMap((product) =>
          product.variants.flatMap((variant) =>
            variant.orderItems.map((item) => item.orderId),
          ),
        ),
      ).size;

      const quantity = category.products.reduce((catSum, product) => {
        return (
          catSum +
          product.variants.reduce((varSum, variant) => {
            return (
              varSum +
              variant.orderItems.reduce(
                (itemSum, item) => itemSum + item.quantity,
                0,
              )
            );
          }, 0)
        );
      }, 0);

      const orderItems = category.products.flatMap((product) =>
        product.variants.flatMap((variant) => variant.orderItems),
      );

      const grouped = groupByPeriod(orderItems, "createdAt", "day");
      const trendData = Array.from(grouped.entries()).map(([date, items]) => ({
        date: format(new Date(date), "MMM dd"),
        revenue: items.reduce((sum, item) => sum + item.subtotalCents, 0),
      }));

      return {
        categoryId: category.id,
        categoryName: category.slug.toUpperCase(),
        totalRevenue: revenue,
        totalOrders: orders,
        totalQuantity: quantity,
        trendData,
      };
    });

    const salesByCategory = categoryStats.map((stat) => ({
      ...stat,
      percentage:
        totalRevenue > 0 ? (stat.totalRevenue / totalRevenue) * 100 : 0,
      trendData: undefined,
    }));

    const trends = categoryStats
      .filter((stat) => stat.trendData.length > 0)
      .map((stat) => ({
        categoryId: stat.categoryId,
        categoryName: stat.categoryName,
        data: stat.trendData,
      }));

    const result: CategoryPerformance = {
      salesByCategory,
      trends,
    };

    return { success: true, data: result };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getCustomerAnalytics(
  timeframe: TimeframeValue,
): Promise<ActionResponse<CustomerAnalytics>> {
  const validationResult = await action({
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { prisma, session } = validationResult;

  if (session?.user.role !== "ADMIN" && session?.user.role !== "SUPER_ADMIN") {
    throw new UnauthorizedError();
  }

  try {
    const { startDate, endDate } = getDateRangeFromTimeframe(timeframe);

    const customerOrders = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        orders: {
          some: {
            status: {
              notIn: ["CANCELLED", "REFUNDED"],
            },
          },
        },
      },
      include: {
        orders: {
          where: {
            status: {
              notIn: ["CANCELLED", "REFUNDED"],
            },
          },
          select: {
            totalCents: true,
            createdAt: true,
          },
        },
      },
    });

    const customerLTVs = customerOrders.map((customer) => {
      const totalSpent = customer.orders.reduce(
        (sum, o) => sum + o.totalCents,
        0,
      );
      const orderCount = customer.orders.length;

      return {
        userId: customer.id,
        userName: customer.name,
        totalSpent,
        orderCount,
      };
    });

    const sortedBySpent = [...customerLTVs].sort(
      (a, b) => b.totalSpent - a.totalSpent,
    );
    const averageLTV =
      customerLTVs.reduce((sum, c) => sum + c.totalSpent, 0) /
      customerLTVs.length;

    const newCustomersCount = await prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const repeatCustomers = customerOrders.filter(
      (c) => c.orders.length > 1,
    ).length;
    const totalCustomers = customerOrders.length;

    const segmentation = [
      {
        segmentName: "High Value (>$1000)",
        customerCount: customerLTVs.filter((c) => c.totalSpent > 100000).length,
        averageOrderValue:
          customerLTVs
            .filter((c) => c.totalSpent > 100000)
            .reduce((sum, c) => sum + c.totalSpent / c.orderCount, 0) /
            customerLTVs.filter((c) => c.totalSpent > 100000).length || 0,
        totalRevenue: customerLTVs
          .filter((c) => c.totalSpent > 100000)
          .reduce((sum, c) => sum + c.totalSpent, 0),
      },
      {
        segmentName: "Medium Value ($500-$1000)",
        customerCount: customerLTVs.filter(
          (c) => c.totalSpent >= 50000 && c.totalSpent <= 100000,
        ).length,
        averageOrderValue:
          customerLTVs
            .filter((c) => c.totalSpent >= 50000 && c.totalSpent <= 100000)
            .reduce((sum, c) => sum + c.totalSpent / c.orderCount, 0) /
            customerLTVs.filter(
              (c) => c.totalSpent >= 50000 && c.totalSpent <= 100000,
            ).length || 0,
        totalRevenue: customerLTVs
          .filter((c) => c.totalSpent >= 50000 && c.totalSpent <= 100000)
          .reduce((sum, c) => sum + c.totalSpent, 0),
      },
      {
        segmentName: "Low Value (<$500)",
        customerCount: customerLTVs.filter((c) => c.totalSpent < 50000).length,
        averageOrderValue:
          customerLTVs
            .filter((c) => c.totalSpent < 50000)
            .reduce((sum, c) => sum + c.totalSpent / c.orderCount, 0) /
            customerLTVs.filter((c) => c.totalSpent < 50000).length || 0,
        totalRevenue: customerLTVs
          .filter((c) => c.totalSpent < 50000)
          .reduce((sum, c) => sum + c.totalSpent, 0),
      },
    ];

    const result: CustomerAnalytics = {
      lifetimeValue: {
        averageLTV,
        topCustomers: sortedBySpent.slice(0, 10),
      },
      acquisitionMetrics: {
        totalCustomers,
        newCustomersThisPeriod: newCustomersCount,
        acquisitionCost: 0,
      },
      repeatCustomerRate: {
        totalCustomers,
        repeatCustomers,
        rate: totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0,
      },
      segmentation,
    };

    return { success: true, data: result };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getInventoryAnalytics(): Promise<
  ActionResponse<InventoryAnalytics>
> {
  const validationResult = await action({
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { prisma, session } = validationResult;

  if (session?.user.role !== "ADMIN" && session?.user.role !== "SUPER_ADMIN") {
    throw new UnauthorizedError();
  }

  try {
    const variants = await prisma.productVariant.findMany({
      include: {
        product: {
          include: {
            category: true,
          },
        },
        orderItems: {
          include: {
            order: true,
          },
        },
        inventoryLogs: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    const categoryStockValues = new Map<
      string,
      { categoryId: string; categoryName: string; value: number }
    >();

    let totalStockValue = 0;

    const productTurnoverRates = variants.map((variant) => {
      const stockValue = variant.stock * variant.priceCents;
      totalStockValue += stockValue;

      const categoryKey = variant.product.category.id;
      if (!categoryStockValues.has(categoryKey)) {
        categoryStockValues.set(categoryKey, {
          categoryId: variant.product.category.id,
          categoryName: variant.product.category.name,
          value: 0,
        });
      }
      const catData = categoryStockValues.get(categoryKey)!;
      catData.value += stockValue;

      const soldQuantity = variant.orderItems
        .filter((item) =>
          ["DELIVERED", "SHIPPED", "PROCESSING"].includes(item.order.status),
        )
        .reduce((sum, item) => sum + item.quantity, 0);

      const turnoverRate =
        variant.stock > 0 ? soldQuantity / (variant.stock + soldQuantity) : 0;

      return {
        variantId: variant.id,
        productId: variant.product.id,
        productName: variant.product.name,
        sku: variant.sku,
        stock: variant.stock,
        turnoverRate,
      };
    });

    const slowMovingItems = variants
      .map((variant) => {
        const lastSale = variant.orderItems
          .filter((item) =>
            ["DELIVERED", "SHIPPED", "PROCESSING"].includes(item.order.status),
          )
          .sort(
            (a, b) => b.order.createdAt.getTime() - a.order.createdAt.getTime(),
          )[0];

        const daysSinceLastSale = lastSale
          ? Math.floor(
              (Date.now() - lastSale.order.createdAt.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 9999;

        return {
          productId: variant.id,
          productName: variant.product.name,
          sku: variant.sku,
          stock: variant.stock,
          daysSinceLastSale,
          stockValue: variant.stock * variant.priceCents,
        };
      })
      .filter((item) => item.stock > 0 && item.daysSinceLastSale > 90)
      .sort((a, b) => b.daysSinceLastSale - a.daysSinceLastSale)
      .slice(0, 20);

    const stockOutLogs = await prisma.inventoryLog.findMany({
      where: {
        type: "ORDER_PLACED",
        resultingStock: 0,
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const stockOutsByProduct = new Map<
      string,
      { count: number; lastDate: Date }
    >();

    stockOutLogs.forEach((log) => {
      const productId = log.variant.product.id;
      if (!stockOutsByProduct.has(productId)) {
        stockOutsByProduct.set(productId, {
          count: 0,
          lastDate: log.createdAt,
        });
      }
      const data = stockOutsByProduct.get(productId)!;
      data.count++;
      if (log.createdAt > data.lastDate) {
        data.lastDate = log.createdAt;
      }
    });

    const affectedProducts = Array.from(stockOutsByProduct.entries())
      .map(([productId, data]) => {
        const log = stockOutLogs.find(
          (l) => l.variant.product.id === productId,
        );
        return {
          productId,
          productName: log?.variant.product.name || "Unknown",
          stockOutCount: data.count,
          lastStockOutDate: data.lastDate.toISOString(),
        };
      })
      .sort((a, b) => b.stockOutCount - a.stockOutCount)
      .slice(0, 10);

    const result: InventoryAnalytics = {
      stockValue: {
        totalValue: totalStockValue,
        byCategory: Array.from(categoryStockValues.values()),
      },
      turnoverRate: {
        averageRate:
          productTurnoverRates.reduce((sum, p) => sum + p.turnoverRate, 0) /
            productTurnoverRates.length || 0,
        byProduct: productTurnoverRates
          .sort((a, b) => a.turnoverRate - b.turnoverRate)
          .slice(0, 20),
      },
      slowMovingItems,
      stockOutFrequency: {
        totalStockOuts: stockOutLogs.length,
        affectedProducts,
      },
    };

    return { success: true, data: result };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getFinancialReport(
  timeframe: TimeframeValue,
): Promise<ActionResponse<FinancialReport>> {
  const validationResult = await action({
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { prisma, session } = validationResult;

  if (session?.user.role !== "ADMIN" && session?.user.role !== "SUPER_ADMIN") {
    throw new UnauthorizedError();
  }

  try {
    const { startDate, endDate } = getDateRangeFromTimeframe(timeframe);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          notIn: ["CANCELLED", "REFUNDED"],
        },
      },
      select: {
        totalCents: true,
        taxCents: true,
        shippingCents: true,
        discountCents: true,
        createdAt: true,
      },
    });

    const grouped = groupByPeriod(orders, "createdAt", "day");
    const revenueTrends = Array.from(grouped.entries()).map(
      ([date, orders]) => ({
        date: format(new Date(date), "MMM dd"),
        revenue: orders.reduce((sum, o) => sum + o.totalCents, 0),
        orders: orders.length,
      }),
    );

    const totalTax = orders.reduce((sum, o) => sum + o.taxCents, 0);
    const taxByPeriod = Array.from(grouped.entries()).map(([date, orders]) => ({
      date: format(new Date(date), "MMM dd"),
      amount: orders.reduce((sum, o) => sum + o.taxCents, 0),
    }));

    const totalShipping = orders.reduce((sum, o) => sum + o.shippingCents, 0);
    const averageShipping =
      orders.length > 0 ? totalShipping / orders.length : 0;
    const shippingByPeriod = Array.from(grouped.entries()).map(
      ([date, orders]) => ({
        date: format(new Date(date), "MMM dd"),
        amount: orders.reduce((sum, o) => sum + o.shippingCents, 0),
      }),
    );

    const totalDiscounts = orders.reduce((sum, o) => sum + o.discountCents, 0);
    const discountedOrders = orders.filter((o) => o.discountCents > 0).length;
    const averageDiscount =
      discountedOrders > 0 ? totalDiscounts / discountedOrders : 0;

    const result: FinancialReport = {
      revenueTrends,
      taxCollected: {
        total: totalTax,
        byPeriod: taxByPeriod,
      },
      shippingRevenue: {
        total: totalShipping,
        average: averageShipping,
        byPeriod: shippingByPeriod,
      },
      discountImpact: {
        totalDiscounts,
        averageDiscount,
        discountedOrders,
        percentageOfOrders:
          orders.length > 0 ? (discountedOrders / orders.length) * 100 : 0,
        byType: [],
      },
    };

    return { success: true, data: result };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
