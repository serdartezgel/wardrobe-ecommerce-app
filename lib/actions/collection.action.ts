"use server";

import { revalidatePath } from "next/cache";
import z from "zod";

import { CollectionWithCount } from "@/types/prisma";

import { Collection, CollectionType, Prisma } from "../generated/prisma";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError } from "../http-errors";
import {
  CollectionInput,
  collectionSchema,
} from "../validations/collection.validation";

export async function getAllCollections(
  includeInactive = false,
): Promise<ActionResponse<CollectionWithCount[]>> {
  const validationResult = await action({
    params: { includeInactive },
    schema: z.object({ includeInactive: z.boolean() }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const where: Prisma.CollectionWhereInput = includeInactive
      ? {}
      : { isActive: true };

    const collections = await prisma.collection.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: [
        { isFeatured: "desc" },
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });

    return {
      success: true,
      data: collections as CollectionWithCount[],
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getCollectionBySlug(
  slug: string,
): Promise<ActionResponse<Collection>> {
  const validationResult = await action({
    params: { slug },
    schema: z.object({ slug: z.string().min(1) }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const collection = await prisma.collection.findUnique({
      where: { slug },
    });

    if (!collection) {
      throw new NotFoundError("Collection");
    }

    return {
      success: true,
      data: collection,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createCollection(
  params: CollectionInput,
): Promise<ActionResponse<Collection>> {
  const validationResult = await action({
    params,
    schema: collectionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    slug,
    name,
    description,
    image,
    type,
    isActive,
    isFeatured,
    order,
    rules,
    metaTitle,
    metaDescription,
    publishedAt,
    validFrom,
    validUntil,
  } = validationResult.params!;

  const prisma = validationResult.prisma;

  try {
    const existingCollection = await prisma.collection.findUnique({
      where: { slug },
    });

    if (existingCollection) {
      return {
        success: false,
        error: { message: "A collection with this name already exists" },
      };
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
        type: type as CollectionType,
        isActive,
        isFeatured,
        order,
        rules: rules || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    });

    revalidatePath("/dashboard/collections");

    return {
      success: true,
      data: collection,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateCollection(
  input: CollectionInput,
): Promise<ActionResponse<Collection>> {
  const validationResult = await action({
    params: input,
    schema: collectionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { id, ...data } = validationResult.params!;
  const prisma = validationResult.prisma;

  if (!id) {
    return handleError(new Error("Collection ID is required")) as ErrorResponse;
  }

  try {
    const existingCollection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!existingCollection) {
      throw new NotFoundError("Collection");
    }

    if (data.slug !== existingCollection.slug) {
      const slugTaken = await prisma.collection.findUnique({
        where: { slug: data.slug },
      });

      if (slugTaken) {
        return {
          success: false,
          error: { message: "A collection with this name already exists" },
        };
      }
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        type: data.type as CollectionType,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        order: data.order,
        rules: data.rules || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        validFrom: data.validFrom ? new Date(data.validFrom) : null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
      },
    });

    revalidatePath("/dashboard/collections");
    revalidatePath(`/dashboard/collections/${id}`);

    return {
      success: true,
      data: collection,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteCollection(
  collectionId: string,
): Promise<ActionResponse<{ success: boolean }>> {
  const validationResult = await action({
    params: { collectionId },
    schema: z.object({ collectionId: z.string().min(1) }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundError("Collection");
    }

    await prisma.collection.delete({
      where: { id: collectionId },
    });

    revalidatePath("/dashboard/collections");

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function toggleCollectionStatus(
  collectionId: string,
): Promise<ActionResponse<Collection>> {
  const validationResult = await action({
    params: { collectionId },
    schema: z.object({ collectionId: z.string().min(1) }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundError("Collection");
    }

    const updated = await prisma.collection.update({
      where: { id: collectionId },
      data: { isActive: !collection.isActive },
    });

    revalidatePath("/dashboard/collections");

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
