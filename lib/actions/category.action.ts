"use server";

import { revalidatePath } from "next/cache";
import z from "zod";

import { CategoryWithChildren } from "@/types/prisma";

import { Category, Prisma, PrismaClient } from "../generated/prisma";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError } from "../http-errors";
import { generateSlug } from "../utils/slug";
import {
  CategoryInput,
  categorySchema,
} from "../validations/category.validation";

export async function createCategory(
  params: CategoryInput,
): Promise<ActionResponse<Category>> {
  const validationResult = await action({
    params,
    schema: categorySchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    name,
    description,
    image,
    isActive,
    parentId,
    metaTitle,
    metaDescription,
  } = validationResult.params!;

  const prisma = validationResult.prisma;

  try {
    let slug = generateSlug(name);

    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });

      slug = `${parentCategory?.slug}-${slug}`;

      if (!parentCategory) throw new NotFoundError("Parent Category");

      if (parentCategory.parentId) {
        const grandParentCategory = await prisma.category.findUnique({
          where: { id: parentCategory.parentId },
        });
        if (grandParentCategory && grandParentCategory.parentId) {
          throw new Error("Cannot create category deeper than 3 levels");
        }
      }
    }

    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) throw new Error("Category already exists");

    const existingOrder = await prisma.category.aggregate({
      where: { parentId },
      _max: {
        order: true,
      },
    });

    const order =
      existingOrder._max.order !== null ? existingOrder._max.order + 1 : 0;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        isActive,
        order,
        parentId,
        metaTitle: metaTitle || name,
        metaDescription: metaDescription || description,
      },
    });

    return { success: true, data: category };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateCategory(
  params: Partial<CategoryInput>,
): Promise<ActionResponse<Category>> {
  const validationResult = await action({
    params,
    schema: categorySchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    id,
    name,
    description,
    image,
    isActive,
    order,
    parentId,
    metaTitle,
    metaDescription,
  } = validationResult.params!;

  const prisma = validationResult.prisma;

  try {
    if (!id) throw new Error("Provide a valid category id");

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) throw new NotFoundError("Category");

    let slug = existingCategory.slug;
    if (name && name !== existingCategory.name) {
      slug = generateSlug(name);
    }

    if (parentId) {
      if (parentId === id) throw new Error("Category cannot be its own parent");

      const isDescendant = await checkIfDescendant(prisma, id, parentId);
      if (isDescendant)
        throw new Error("Cannot set a descendant category as parent");

      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) throw new NotFoundError("Parent Category");

      if (parentCategory?.parentId) {
        const grandParentCategory = await prisma.category.findUnique({
          where: { id: parentCategory.parentId },
        });
        if (grandParentCategory?.parentId) {
          throw new Error("Cannot set parent deeper than 3 levels");
        }
      }

      slug = `${parentCategory.slug}-${slug}`;
    }

    const slugExists = await prisma.category.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });

    if (slugExists) throw new Error("A category with this name already exists");

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name || existingCategory.name,
        slug,
        description:
          description !== undefined
            ? description
            : existingCategory.description,
        image: image !== undefined ? image : existingCategory.image,
        isActive: isActive !== undefined ? isActive : existingCategory.isActive,
        order: order !== undefined ? order : existingCategory.order,
        parentId: parentId !== undefined ? parentId : existingCategory.parentId,
        metaTitle:
          metaTitle !== undefined ? metaTitle : existingCategory.metaTitle,
        metaDescription:
          metaDescription !== undefined
            ? metaDescription
            : existingCategory.metaDescription,
      },
    });

    return { success: true, data: updatedCategory };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

async function checkIfDescendant(
  prisma: PrismaClient,
  categoryId: string,
  potentialParentId: string,
): Promise<boolean> {
  let currentId: string | null = potentialParentId;
  const visited = new Set<string>();

  while (currentId) {
    if (currentId === categoryId) return true;
    if (visited.has(currentId)) break; // Circular reference
    visited.add(currentId);

    const category: Prisma.CategoryGetPayload<{
      select: { parentId: true };
    }> | null = await prisma.category.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });

    currentId = category?.parentId || null;
  }

  return false;
}

export async function deleteCategory(
  id: string,
): Promise<ActionResponse<{ id: string }>> {
  const validationResult = await action({
    params: { id },
    schema: z.object({ id: z.string().min(1) }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        products: true,
      },
    });

    if (!category) throw new NotFoundError("Category");

    if (category.children.length > 0)
      throw new Error(
        "Cannot delete category with subcategories. Please delete or reassign subcategories first.",
      );

    if (category.products.length > 0)
      throw new Error(
        `Cannot delete category with ${category.products.length} product(s). Please reassign or delete products first.`,
      );

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/dashboard/categories");

    return {
      success: true,
      data: { id },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getCategory(id: string): Promise<
  ActionResponse<
    Category & {
      children: (Category & { children: Category[] })[];
      _count: { products: number };
    }
  >
> {
  const validationResult = await action({
    params: { id },
    schema: z.object({ id: z.string().min(1) }),
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: {
          orderBy: { order: "asc" },
          include: {
            children: {
              orderBy: { order: "asc" },
            },
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) throw new NotFoundError("Category");

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getAllCategories(
  includeInactive = false,
): Promise<ActionResponse<CategoryWithChildren[]>> {
  const validationResult = await action({
    params: { includeInactive },
    schema: z.object({ includeInactive: z.boolean() }),
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const categories = await prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: { select: { products: true } }, // top level
        children: {
          where: includeInactive ? {} : { isActive: true },
          orderBy: { order: "asc" },
          include: {
            _count: { select: { products: true } }, // subcategory
            children: {
              where: includeInactive ? {} : { isActive: true },
              orderBy: { order: "asc" },
              include: {
                _count: { select: { products: true } }, // grandchild
              },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    const topLevelCategories = categories.filter((cat) => !cat.parentId);

    return {
      success: true,
      data: topLevelCategories,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function reorderCategories(
  categories: { id: string; order: number }[],
): Promise<ActionResponse<{ success: boolean }>> {
  const validationResult = await action({
    params: { categories },
    schema: z.object({
      categories: z.array(
        z.object({
          id: z.string(),
          order: z.number().int().min(0),
        }),
      ),
    }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    await prisma.$transaction(
      categories.map((cat) =>
        prisma.category.update({
          where: { id: cat.id },
          data: { order: cat.order },
        }),
      ),
    );

    revalidatePath("/dashboard/categories");

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
