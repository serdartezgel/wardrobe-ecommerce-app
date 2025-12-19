"use server";

import { revalidatePath } from "next/cache";
import z from "zod";

import { CouponWithRelations } from "@/types/prisma";

import { Coupon, Prisma } from "../generated/prisma";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError } from "../http-errors";
import { CouponInput, couponSchema } from "../validations/coupon.validation";

export async function getAllCoupons(
  status?: "active" | "scheduled" | "expired",
): Promise<ActionResponse<CouponWithRelations[]>> {
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
    let where: Prisma.CouponWhereInput = {};

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

    const coupons = await prisma.coupon.findMany({
      where,
      include: {
        collections: { include: { collection: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: coupons as CouponWithRelations[],
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getCouponById(
  couponId: string,
): Promise<ActionResponse<CouponWithRelations>> {
  const validationResult = await action({
    params: { couponId },
    schema: z.object({ couponId: z.string().min(1) }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: {
        collections: { include: { collection: true } },
      },
    });

    if (!coupon) {
      throw new NotFoundError("Coupon");
    }

    return {
      success: true,
      data: coupon as CouponWithRelations,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createCoupon(
  params: CouponInput,
): Promise<ActionResponse<Coupon>> {
  const validationResult = await action({
    params,
    schema: couponSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    code,
    type,
    valueCents,
    minPurchaseCents,
    maxDiscountCents,
    usageLimit,
    validFrom,
    validUntil,
    isActive,
    collectionIds,
  } = validationResult.params!;

  const prisma = validationResult.prisma;

  try {
    const existing = await prisma.coupon.findUnique({
      where: { code },
    });

    if (existing) {
      return {
        success: false,
        error: { message: "Coupon code already exists" },
      };
    }

    const coupon = await prisma.$transaction(async (tx) => {
      const newCoupon = await tx.coupon.create({
        data: {
          code,
          type,
          valueCents,
          minPurchaseCents,
          maxDiscountCents,
          usageLimit,
          validFrom: new Date(validFrom),
          validUntil: new Date(validUntil),
          isActive,
        },
      });

      if (collectionIds && collectionIds.length > 0) {
        await tx.collectionCoupon.createMany({
          data: collectionIds.map((collectionId) => ({
            couponId: newCoupon.id,
            collectionId,
          })),
        });
      }

      return newCoupon;
    });

    revalidatePath("/dashboard/deals-coupons");

    return {
      success: true,
      data: coupon,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateCoupon(
  params: CouponInput,
): Promise<ActionResponse<Coupon>> {
  const validationResult = await action({
    params,
    schema: couponSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { id, code, collectionIds, ...data } = validationResult.params!;

  if (!id) {
    return handleError(new Error("Coupon ID is required")) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const existing = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError("Coupon");
    }

    if (code !== existing.code) {
      const codeExists = await prisma.coupon.findUnique({
        where: { code },
      });
      if (codeExists) {
        return {
          success: false,
          error: { message: "Coupon code already exists" },
        };
      }
    }

    const coupon = await prisma.$transaction(async (tx) => {
      const updated = await tx.coupon.update({
        where: { id },
        data: {
          code,
          ...data,
          validFrom: new Date(data.validFrom),
          validUntil: new Date(data.validUntil),
        },
      });

      await tx.collectionCoupon.deleteMany({ where: { couponId: id } });
      if (collectionIds && collectionIds.length > 0) {
        await tx.collectionCoupon.createMany({
          data: collectionIds.map((collectionId) => ({
            couponId: id,
            collectionId,
          })),
        });
      }

      return updated;
    });

    revalidatePath("/dashboard/deals-coupons");
    revalidatePath(`/dashboard/deals-coupons/coupons/${id}`);

    return {
      success: true,
      data: coupon,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteCoupon(
  couponId: string,
): Promise<ActionResponse<{ success: boolean }>> {
  const validationResult = await action({
    params: { couponId },
    schema: z.object({ couponId: z.string().min(1) }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon) {
      throw new NotFoundError("Coupon");
    }

    await prisma.coupon.delete({
      where: { id: couponId },
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

export async function toggleCouponStatus(
  couponId: string,
): Promise<ActionResponse<Coupon>> {
  const validationResult = await action({
    params: { couponId },
    schema: z.object({ couponId: z.string().min(1) }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon) {
      throw new NotFoundError("Coupon");
    }

    const updated = await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: !coupon.isActive },
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

export async function generateBulkCoupons(input: {
  prefix: string;
  count: number;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  valueCents: number;
  validFrom: string;
  validUntil: string;
}): Promise<ActionResponse<{ codes: string[]; count: number }>> {
  const validationResult = await action({
    params: input,
    schema: z.object({
      prefix: z.string().min(2),
      count: z.number().min(1).max(1000),
      type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
      valueCents: z.number().min(1),
      validFrom: z.string(),
      validUntil: z.string(),
    }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { prefix, count, type, valueCents, validFrom, validUntil } =
    validationResult.params!;
  const prisma = validationResult.prisma;

  try {
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      const randomSuffix = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      const code = `${prefix}-${randomSuffix}`;
      codes.push(code);
    }

    await prisma.coupon.createMany({
      data: codes.map((code) => ({
        code,
        type,
        valueCents,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        isActive: true,
      })),
    });

    revalidatePath("/dashboard/deals-coupons");

    return {
      success: true,
      data: { codes, count: codes.length },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
