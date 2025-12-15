"use server";

import { revalidatePath } from "next/cache";
import z from "zod";

import { WishlistWithProduct } from "@/types/prisma";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError, UnauthorizedError } from "../http-errors";

export async function getUserWishlist(): Promise<
  ActionResponse<WishlistWithProduct[]>
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
    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              take: 1,
              orderBy: { order: "asc" },
            },
            brand: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: wishlist as WishlistWithProduct[],
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function addToWishlist(
  productId: string,
): Promise<ActionResponse<{ success: boolean }>> {
  const validationResult = await action({
    params: { productId },
    schema: z.object({ productId: z.string().min(1) }),
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
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError("Product");
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      return {
        success: false,
        error: { message: "Product already in wishlist" },
      };
    }

    await prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
    });

    revalidatePath("/account/wishlist");

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function removeFromWishlist(
  productId: string,
): Promise<ActionResponse<{ success: boolean }>> {
  const validationResult = await action({
    params: { productId },
    schema: z.object({ productId: z.string().min(1) }),
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
    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!wishlistItem) {
      throw new NotFoundError("Wishlist item");
    }

    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    revalidatePath("/account/wishlist");

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
