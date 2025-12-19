"use server";

import { revalidatePath } from "next/cache";
import z from "zod";

import { ReviewAdminWithRelations, ReviewWithRelations } from "@/types/prisma";

import { Prisma } from "../generated/prisma";
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

// Dashboard actions
export async function getAllReviews(params?: {
  rating?: number;
  isVerified?: boolean;
  productId?: string;
}): Promise<ActionResponse<ReviewAdminWithRelations[]>> {
  const validationResult = await action({
    params: params || {},
    schema: z.object({
      rating: z.number().optional(),
      isVerified: z.boolean().optional(),
      productId: z.string().optional(),
    }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { rating, isVerified, productId } = validationResult.params!;
  const prisma = validationResult.prisma;

  try {
    const where: Prisma.ReviewWhereInput = {};

    if (rating) where.rating = rating;
    if (isVerified !== undefined) where.isVerified = isVerified;
    if (productId) where.productId = productId;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        product: {
          include: {
            images: { take: 1, orderBy: { order: "asc" } },
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
      data: reviews as ReviewAdminWithRelations[],
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getReviewById(
  reviewId: string,
): Promise<ActionResponse<ReviewAdminWithRelations>> {
  const validationResult = await action({
    params: { reviewId },
    schema: z.object({ reviewId: z.string().min(1) }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        product: {
          include: {
            images: { take: 1, orderBy: { order: "asc" } },
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

    if (!review) {
      throw new NotFoundError("Review");
    }

    return {
      success: true,
      data: review as ReviewAdminWithRelations,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteReviewAdmin(
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

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { product: true },
    });

    if (!review) {
      throw new NotFoundError("Review");
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    revalidatePath("/dashboard/reviews");
    revalidatePath(`/products/${review.product.slug}`);

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function toggleReviewVerification(
  reviewId: string,
): Promise<ActionResponse<ReviewAdminWithRelations>> {
  const validationResult = await action({
    params: { reviewId },
    schema: z.object({ reviewId: z.string().min(1) }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundError("Review");
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { isVerified: !review.isVerified },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        product: {
          include: {
            images: { take: 1, orderBy: { order: "asc" } },
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

    revalidatePath("/dashboard/reviews");

    return {
      success: true,
      data: updated as ReviewAdminWithRelations,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getReviewStatistics(): Promise<
  ActionResponse<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { rating: number; count: number }[];
    verifiedCount: number;
    unverifiedCount: number;
    recentReviews: number;
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
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalReviews, avgRating, ratingGroups, verifiedCount, recentCount] =
      await Promise.all([
        prisma.review.count(),
        prisma.review.aggregate({
          _avg: { rating: true },
        }),
        prisma.review.groupBy({
          by: ["rating"],
          _count: { rating: true },
          orderBy: { rating: "desc" },
        }),
        prisma.review.count({ where: { isVerified: true } }),
        prisma.review.count({
          where: { createdAt: { gte: thirtyDaysAgo } },
        }),
      ]);

    const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: ratingGroups.find((g) => g.rating === rating)?._count.rating || 0,
    }));

    return {
      success: true,
      data: {
        totalReviews,
        averageRating: avgRating._avg.rating || 0,
        ratingDistribution,
        verifiedCount,
        unverifiedCount: totalReviews - verifiedCount,
        recentReviews: recentCount,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function bulkDeleteReviews(
  reviewIds: string[],
): Promise<ActionResponse<{ count: number }>> {
  const validationResult = await action({
    params: { reviewIds },
    schema: z.object({
      reviewIds: z.array(z.string()).min(1),
    }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const result = await prisma.review.deleteMany({
      where: { id: { in: reviewIds } },
    });

    revalidatePath("/dashboard/reviews");

    return {
      success: true,
      data: { count: result.count },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
