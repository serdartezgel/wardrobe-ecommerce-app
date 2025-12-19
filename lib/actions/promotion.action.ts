"use server";

import { revalidatePath } from "next/cache";
import z from "zod";

import { PromotionWithRelations } from "@/types/prisma";

import { Prisma, Promotion, PromotionType } from "../generated/prisma";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError } from "../http-errors";
import {
  PromotionInput,
  promotionSchema,
} from "../validations/promotion.validation";

export async function getAllPromotions(
  status?: "active" | "scheduled" | "expired",
): Promise<ActionResponse<PromotionWithRelations[]>> {
  const validationResult = await action({
    params: { status },
    schema: z.object({ status: z.string().optional() }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const now = new Date();
    let where: Prisma.PromotionWhereInput = {};

    if (status === "active") {
      where = {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
      };
    } else if (status === "scheduled") {
      where = {
        isActive: true,
        validFrom: { gt: now },
      };
    } else if (status === "expired") {
      where = {
        validUntil: { lt: now },
      };
    }

    const promotions = await prisma.promotion.findMany({
      where,
      include: {
        applicableCategories: { include: { category: true } },
        applicableBrands: { include: { brand: true } },
        applicableProducts: { include: { product: true } },
        applicableCollections: { include: { collection: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: promotions as PromotionWithRelations[],
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getPromotionById(
  promotionId: string,
): Promise<ActionResponse<PromotionWithRelations>> {
  const validationResult = await action({
    params: { promotionId },
    schema: z.object({ promotionId: z.string().min(1) }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
      include: {
        applicableCategories: { include: { category: true } },
        applicableBrands: { include: { brand: true } },
        applicableProducts: { include: { product: true } },
        applicableCollections: { include: { collection: true } },
      },
    });

    if (!promotion) {
      throw new NotFoundError("Promotion");
    }

    return {
      success: true,
      data: promotion as PromotionWithRelations,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createPromotion(
  params: PromotionInput,
): Promise<ActionResponse<Promotion>> {
  const validationResult = await action({
    params,
    schema: promotionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    name,
    code,
    type,
    discountType,
    discountValueCents,
    minPurchaseCents,
    minQuantity,
    maxDiscountCents,
    bogoConfig,
    usageLimit,
    usagePerCustomer,
    validFrom,
    validUntil,
    isActive,
    applyToAllProducts,
    excludeSaleItems,
    categoryIds,
    brandIds,
    productIds,
    collectionIds,
  } = validationResult.params!;

  const prisma = validationResult.prisma;

  try {
    if (code) {
      const existing = await prisma.promotion.findUnique({
        where: { code },
      });
      if (existing) {
        return {
          success: false,
          error: { message: "Promotion code already exists" },
        };
      }
    }

    const promotion = await prisma.$transaction(async (tx) => {
      const newPromotion = await tx.promotion.create({
        data: {
          name,
          code: code || null,
          type: type as PromotionType,
          discountType,
          discountValueCents,
          minPurchaseCents,
          minQuantity,
          maxDiscountCents,
          bogoConfig,
          usageLimit,
          usagePerCustomer,
          validFrom: new Date(validFrom),
          validUntil: new Date(validUntil),
          isActive,
          applyToAllProducts,
          excludeSaleItems,
        },
      });

      if (categoryIds && categoryIds.length > 0) {
        await tx.promotionCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            promotionId: newPromotion.id,
            categoryId,
          })),
        });
      }

      if (brandIds && brandIds.length > 0) {
        await tx.promotionBrand.createMany({
          data: brandIds.map((brandId) => ({
            promotionId: newPromotion.id,
            brandId,
          })),
        });
      }

      if (productIds && productIds.length > 0) {
        await tx.promotionProduct.createMany({
          data: productIds.map((productId) => ({
            promotionId: newPromotion.id,
            productId,
          })),
        });
      }

      if (collectionIds && collectionIds.length > 0) {
        await tx.promotionCollection.createMany({
          data: collectionIds.map((collectionId) => ({
            promotionId: newPromotion.id,
            collectionId,
          })),
        });
      }

      return newPromotion;
    });

    revalidatePath("/dashboard/deals-coupons");

    return {
      success: true,
      data: promotion,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updatePromotion(
  params: PromotionInput,
): Promise<ActionResponse<Promotion>> {
  const validationResult = await action({
    params,
    schema: promotionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    id,
    code,
    categoryIds,
    brandIds,
    productIds,
    collectionIds,
    ...data
  } = validationResult.params!;

  if (!id) {
    return handleError(new Error("Promotion ID is required")) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const existing = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Promotion");
    }

    if (code && code !== existing.code) {
      const codeExists = await prisma.promotion.findUnique({
        where: { code },
      });
      if (codeExists) {
        return {
          success: false,
          error: { message: "Promotion code already exists" },
        };
      }
    }

    const promotion = await prisma.$transaction(async (tx) => {
      const updated = await tx.promotion.update({
        where: { id },
        data: {
          ...data,
          code: code || null,
          type: data.type as PromotionType,
          validFrom: new Date(data.validFrom),
          validUntil: new Date(data.validUntil),
        },
      });

      await tx.promotionCategory.deleteMany({ where: { promotionId: id } });
      if (categoryIds && categoryIds.length > 0) {
        await tx.promotionCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            promotionId: id,
            categoryId,
          })),
        });
      }

      await tx.promotionBrand.deleteMany({ where: { promotionId: id } });
      if (brandIds && brandIds.length > 0) {
        await tx.promotionBrand.createMany({
          data: brandIds.map((brandId) => ({
            promotionId: id,
            brandId,
          })),
        });
      }

      await tx.promotionProduct.deleteMany({ where: { promotionId: id } });
      if (productIds && productIds.length > 0) {
        await tx.promotionProduct.createMany({
          data: productIds.map((productId) => ({
            promotionId: id,
            productId,
          })),
        });
      }

      await tx.promotionCollection.deleteMany({ where: { promotionId: id } });
      if (collectionIds && collectionIds.length > 0) {
        await tx.promotionCollection.createMany({
          data: collectionIds.map((collectionId) => ({
            promotionId: id,
            collectionId,
          })),
        });
      }

      return updated;
    });

    revalidatePath("/dashboard/deals-coupons");
    revalidatePath(`/dashboard/deals-coupons/promotions/${id}`);

    return {
      success: true,
      data: promotion,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deletePromotion(
  promotionId: string,
): Promise<ActionResponse<{ success: boolean }>> {
  const validationResult = await action({
    params: { promotionId },
    schema: z.object({ promotionId: z.string().min(1) }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!promotion) {
      throw new NotFoundError("Promotion");
    }

    await prisma.promotion.delete({
      where: { id: promotionId },
    });

    revalidatePath("/dashboard/deals-coupons");

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function togglePromotionStatus(
  promotionId: string,
): Promise<ActionResponse<Promotion>> {
  const validationResult = await action({
    params: { promotionId },
    schema: z.object({ promotionId: z.string().min(1) }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
    });

    if (!promotion) {
      throw new NotFoundError("Promotion");
    }

    const updated = await prisma.promotion.update({
      where: { id: promotionId },
      data: { isActive: !promotion.isActive },
    });

    revalidatePath("/dashboard/deals-coupons");

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
