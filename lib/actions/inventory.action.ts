"use server";

import { revalidatePath } from "next/cache";
import z from "zod";

import { InventoryLog, Prisma, ProductVariant } from "../generated/prisma";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError } from "../http-errors";
import {
  adjustInventorySchema,
  bulkAdjustInventorySchema,
  getInventoryLogsSchema,
} from "../validations/inventory.validation";

export async function adjustInventory(
  params: z.infer<typeof adjustInventorySchema>,
): Promise<ActionResponse<{ variant: ProductVariant; log: InventoryLog }>> {
  const validationResult = await action({
    params,
    schema: adjustInventorySchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { variantId, change, type, note, orderId } = validationResult.params!;
  const prisma = validationResult.prisma;
  const userId = validationResult.session?.user.id;

  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          select: { name: true, slug: true },
        },
      },
    });

    if (!variant) {
      throw new NotFoundError("Product Variant");
    }

    const newStock = variant.stock + change;

    if (newStock < 0) {
      throw new Error("Insufficient stock. Cannot reduce below 0.");
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedVariant = await tx.productVariant.update({
        where: { id: variantId },
        data: { stock: newStock },
      });

      const log = await tx.inventoryLog.create({
        data: {
          variantId,
          change,
          resultingStock: newStock,
          type,
          note,
          orderId,
          adminId: userId,
        },
        include: {
          variant: {
            include: {
              product: true,
              variantOptions: {
                include: { option: true },
              },
            },
          },
          admin: {
            select: { name: true, email: true },
          },
        },
      });

      return { variant: updatedVariant, log };
    });

    revalidatePath("/dashboard/inventory");
    revalidatePath(`/dashboard/products/${variant.product.slug}`);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function bulkAdjustInventory(
  params: z.infer<typeof bulkAdjustInventorySchema>,
): Promise<ActionResponse<{ updated: number }>> {
  const validationResult = await action({
    params,
    schema: bulkAdjustInventorySchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { adjustments, type } = validationResult.params!;
  const prisma = validationResult.prisma;
  const userId = validationResult.session?.user.id;

  try {
    let updated = 0;

    await prisma.$transaction(async (tx) => {
      for (const adjustment of adjustments) {
        const variant = await tx.productVariant.findUnique({
          where: { id: adjustment.variantId },
        });

        if (!variant) continue;

        const newStock = variant.stock + adjustment.change;

        if (newStock < 0) continue;

        await tx.productVariant.update({
          where: { id: adjustment.variantId },
          data: { stock: newStock },
        });

        await tx.inventoryLog.create({
          data: {
            variantId: adjustment.variantId,
            change: adjustment.change,
            resultingStock: newStock,
            type,
            note: adjustment.note,
            adminId: userId,
          },
        });

        updated++;
      }
    });

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard/products");

    return {
      success: true,
      data: { updated },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getInventoryLogs(
  params: z.infer<typeof getInventoryLogsSchema>,
): Promise<ActionResponse<{ logs: InventoryLog[]; total: number }>> {
  const validationResult = await action({
    params,
    schema: getInventoryLogsSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { variantId, productId, type, startDate, endDate } =
    validationResult.params!;
  const prisma = validationResult.prisma;

  try {
    const where: Prisma.InventoryLogWhereInput = {};

    if (variantId) {
      where.variantId = variantId;
    }

    if (productId) {
      where.variant = {
        productId,
      };
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.inventoryLog.findMany({
        where,
        include: {
          variant: {
            include: {
              product: {
                select: { name: true, slug: true },
              },
              variantOptions: {
                include: { option: true },
              },
            },
          },
          admin: {
            select: { name: true, email: true },
          },
          order: {
            select: { orderNumber: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.inventoryLog.count({ where }),
    ]);

    return {
      success: true,
      data: {
        logs,
        total,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getLowStockItems(
  threshold: number = 10,
): Promise<ActionResponse<ProductVariant[]>> {
  const validationResult = await action({
    params: { threshold },
    schema: z.object({ threshold: z.number().int().positive() }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const lowStockVariants = await prisma.productVariant.findMany({
      where: {
        stock: { lte: threshold, gt: 0 },
        product: { isActive: true },
      },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
            images: { take: 1, orderBy: { order: "asc" } },
          },
        },
        variantOptions: {
          include: { option: true },
        },
      },
      orderBy: { stock: "asc" },
    });

    return {
      success: true,
      data: lowStockVariants,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getOutOfStockItems(): Promise<
  ActionResponse<ProductVariant[]>
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
    const outOfStockVariants = await prisma.productVariant.findMany({
      where: {
        stock: 0,
        product: { isActive: true },
      },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
            images: { take: 1, orderBy: { order: "asc" } },
          },
        },
        variantOptions: {
          include: { option: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return {
      success: true,
      data: outOfStockVariants,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getInventoryStats(): Promise<
  ActionResponse<{
    totalVariants: number;
    lowStock: number;
    outOfStock: number;
    inStock: number;
    totalUnits: number;
    inventoryValue: number;
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
    const [totalVariants, lowStock, outOfStock, totalValue] = await Promise.all(
      [
        prisma.productVariant.count({
          where: { product: { isActive: true } },
        }),

        prisma.productVariant.count({
          where: {
            stock: { lte: 10, gt: 0 },
            product: { isActive: true },
          },
        }),

        prisma.productVariant.count({
          where: {
            stock: 0,
            product: { isActive: true },
          },
        }),

        prisma.productVariant.aggregate({
          where: { product: { isActive: true } },
          _sum: {
            stock: true,
          },
        }),
      ],
    );

    const variants = await prisma.productVariant.findMany({
      where: { product: { isActive: true } },
      select: { stock: true, priceCents: true },
    });

    const inventoryValue = variants.reduce(
      (sum, v) => sum + v.stock * v.priceCents,
      0,
    );

    return {
      success: true,
      data: {
        totalVariants,
        lowStock,
        outOfStock,
        inStock: totalVariants - outOfStock,
        totalUnits: totalValue._sum.stock || 0,
        inventoryValue,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
