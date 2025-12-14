"use server";

import { revalidatePath } from "next/cache";
import z from "zod";

import type { OrderWithRelations, OrderListItem } from "@/types/prisma";

import { Order, OrderStatus, Prisma } from "../generated/prisma";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError } from "../http-errors";
import {
  updateOrderStatusSchema,
  addTrackingNumberSchema,
  cancelOrderSchema,
  refundOrderSchema,
  UpdateOrderStatusInput,
  AddTrackingNumberInput,
  CancelOrderInput,
  RefundOrderInput,
} from "../validations/order.validation";

export async function getAllOrders(params?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ActionResponse<{ orders: OrderListItem[]; total: number }>> {
  const validationResult = await action({
    params: params || {},
    schema: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { startDate, endDate } = validationResult.params!;
  const prisma = validationResult.prisma;

  try {
    const where: Prisma.OrderWhereInput = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          items: {
            select: { id: true, quantity: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      success: true,
      data: {
        orders: orders as OrderListItem[],
        total,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getOrderById(
  orderId: string,
): Promise<ActionResponse<OrderWithRelations>> {
  const validationResult = await action({
    params: { orderId },
    schema: z.object({ orderId: z.string().min(1) }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        shippingAddress: true,
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    images: { take: 1, orderBy: { order: "asc" } },
                  },
                },
                variantOptions: {
                  include: { option: true },
                },
              },
            },
          },
        },
        reviews: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Order");
    }

    return {
      success: true,
      data: order as OrderWithRelations,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateOrderStatus(
  params: UpdateOrderStatusInput,
): Promise<ActionResponse<OrderWithRelations>> {
  const validationResult = await action({
    params,
    schema: updateOrderStatusSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { orderId, status, trackingNumber, notes } = validationResult.params!;
  const prisma = validationResult.prisma;
  const userId = validationResult.session?.user.id;

  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            productVariant: true,
          },
        },
      },
    });

    if (!existingOrder) {
      throw new NotFoundError("Order");
    }

    if (status === "CANCELLED" && existingOrder.status !== "CANCELLED") {
      await prisma.$transaction(async (tx) => {
        for (const item of existingOrder.items) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.productVariantId },
          });

          if (variant) {
            const newStock = variant.stock + item.quantity;

            await tx.productVariant.update({
              where: { id: item.productVariantId },
              data: { stock: newStock },
            });

            await tx.inventoryLog.create({
              data: {
                variantId: item.productVariantId,
                change: item.quantity,
                resultingStock: newStock,
                type: "ORDER_CANCELLED",
                orderId,
                adminId: userId,
                note: notes || "Order cancelled - stock returned",
              },
            });
          }
        }
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        trackingNumber: trackingNumber || existingOrder.trackingNumber,
        notes: notes || existingOrder.notes,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        shippingAddress: true,
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: { images: { take: 1 } },
                },
                variantOptions: {
                  include: { option: true },
                },
              },
            },
          },
        },
        reviews: true,
      },
    });

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);

    return {
      success: true,
      data: updatedOrder as OrderWithRelations,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function addTrackingNumber(
  params: AddTrackingNumberInput,
): Promise<ActionResponse<OrderWithRelations>> {
  const validationResult = await action({
    params,
    schema: addTrackingNumberSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { orderId, trackingNumber } = validationResult.params!;
  const prisma = validationResult.prisma;

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber,
        status: "SHIPPED",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        shippingAddress: true,
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: { images: { take: 1 } },
                },
                variantOptions: {
                  include: { option: true },
                },
              },
            },
          },
        },
        reviews: true,
      },
    });

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);

    return {
      success: true,
      data: order as OrderWithRelations,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function cancelOrder(
  params: CancelOrderInput,
): Promise<ActionResponse<OrderWithRelations>> {
  const validationResult = await action({
    params,
    schema: cancelOrderSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { orderId, reason } = validationResult.params!;

  return updateOrderStatus({
    orderId,
    status: "CANCELLED",
    notes: reason,
  });
}

export async function refundOrder(
  params: RefundOrderInput,
): Promise<ActionResponse<OrderWithRelations>> {
  const validationResult = await action({
    params,
    schema: refundOrderSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { orderId, reason } = validationResult.params!;

  // Process the refund with payment provider here

  return updateOrderStatus({
    orderId,
    status: "REFUNDED",
    notes: reason || "Order refunded",
  });
}

export async function getOrderStatistics(): Promise<
  ActionResponse<{
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    revenue30Days: number;
    averageOrderValue: number;
    recentOrders: Order[];
  }>
> {
  const validationResult = await action({
    params: {},
    schema: z.object({}),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenueStats,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "PROCESSING" } }),
      prisma.order.count({ where: { status: "SHIPPED" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.count({ where: { status: "CANCELLED" } }),
      prisma.order.aggregate({
        where: {
          status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] },
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { total: true },
        _avg: { total: true },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          items: {
            select: { id: true, quantity: true },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        revenue30Days: revenueStats._sum.total?.toNumber() || 0,
        averageOrderValue: revenueStats._avg.total?.toNumber() || 0,
        recentOrders,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function bulkUpdateOrderStatus(
  orderIds: string[],
  status: string,
): Promise<ActionResponse<{ count: number }>> {
  const validationResult = await action({
    params: { orderIds, status },
    schema: z.object({
      orderIds: z.array(z.string()).min(1),
      status: z.enum([
        "PENDING",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED",
      ]),
    }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const result = await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { status: status as OrderStatus },
    });

    revalidatePath("/dashboard/orders");

    return {
      success: true,
      data: { count: result.count },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
