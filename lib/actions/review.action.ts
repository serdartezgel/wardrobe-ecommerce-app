"use server";

import { revalidatePath } from "next/cache";
import z from "zod";

import { ReviewWithRelations } from "@/types/prisma";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError, UnauthorizedError } from "../http-errors";
import { ReviewInput, reviewSchema } from "../validations/review.validation";

export async function getUserReviews(): Promise<
  ActionResponse<ReviewWithRelations[]>
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
  const userId = validationResult.session?.user.id;

  if (!userId) {
    throw new UnauthorizedError();
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              take: 1,
              orderBy: { order: "asc" },
            },
            brand: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: reviews as ReviewWithRelations[],
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getPendingReviews(): Promise<
  ActionResponse<
    Array<{
      orderId: string;
      orderNumber: string;
      productId: string;
      productName: string;
      productImage: string | null;
      brandName: string;
    }>
  >
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
  const userId = validationResult.session?.user.id;

  if (!userId) {
    throw new UnauthorizedError();
  }

  try {
    const deliveredOrders = await prisma.order.findMany({
      where: {
        userId,
        status: "DELIVERED",
      },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    images: {
                      take: 1,
                      orderBy: { order: "asc" },
                    },
                    brand: true,
                    reviews: {
                      where: { userId },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const pendingReviews = deliveredOrders.flatMap((order) =>
      order.items
        .filter((item) => item.productVariant.product.reviews.length === 0)
        .map((item) => ({
          orderId: order.id,
          orderNumber: order.orderNumber,
          productId: item.productVariant.product.id,
          productName: item.productVariant.product.name,
          productImage: item.productVariant.product.images[0]?.url || null,
          brandName: item.productVariant.product.brand.name,
        })),
    );

    return {
      success: true,
      data: pendingReviews,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createReview(
  input: ReviewInput,
): Promise<ActionResponse<ReviewWithRelations>> {
  const validationResult = await action({
    params: input,
    schema: reviewSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { productId, orderId, rating, title, comment } =
    validationResult.params!;
  const prisma = validationResult.prisma;
  const userId = validationResult.session?.user.id;

  if (!userId) {
    throw new UnauthorizedError();
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId, userId, status: "DELIVERED" },
      include: {
        items: {
          where: {
            productVariant: {
              productId,
            },
          },
        },
      },
    });

    if (!order || order.items.length === 0) {
      return {
        success: false,
        error: { message: "Invalid order or product not in order" },
      };
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingReview) {
      return {
        success: false,
        error: { message: "You have already reviewed this product" },
      };
    }

    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        orderId,
        rating,
        title: title || null,
        comment: comment || null,
        isVerified: true,
      },
      include: {
        product: {
          include: {
            images: {
              take: 1,
              orderBy: { order: "asc" },
            },
            brand: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
          },
        },
      },
    });

    revalidatePath("/account/reviews");
    revalidatePath(`/products/${review.product.slug}`);

    return {
      success: true,
      data: review as ReviewWithRelations,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateReview(
  input: ReviewInput,
): Promise<ActionResponse<ReviewWithRelations>> {
  const validationResult = await action({
    params: input,
    schema: reviewSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { id, rating, title, comment } = validationResult.params!;
  const prisma = validationResult.prisma;
  const userId = validationResult.session?.user.id;

  if (!userId || !id) {
    throw new UnauthorizedError();
  }

  try {
    const existingReview = await prisma.review.findUnique({
      where: { id, userId },
    });

    if (!existingReview) {
      throw new NotFoundError("Review");
    }

    const review = await prisma.review.update({
      where: { id },
      data: {
        rating,
        title: title || null,
        comment: comment || null,
      },
      include: {
        product: {
          include: {
            images: {
              take: 1,
              orderBy: { order: "asc" },
            },
            brand: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
          },
        },
      },
    });

    revalidatePath("/account/reviews");
    revalidatePath(`/products/${review.product.slug}`);

    return {
      success: true,
      data: review as ReviewWithRelations,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteReview(
  reviewId: string,
): Promise<ActionResponse<{ success: boolean }>> {
  const validationResult = await action({
    params: { reviewId },
    schema: z.object({ reviewId: z.string().min(1) }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;
  const userId = validationResult.session?.user.id;

  if (!userId) {
    throw new UnauthorizedError();
  }

  try {
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId, userId },
      include: {
        product: true,
      },
    });

    if (!existingReview) {
      throw new NotFoundError("Review");
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    revalidatePath("/account/reviews");
    revalidatePath(`/products/${existingReview.product.slug}`);

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
