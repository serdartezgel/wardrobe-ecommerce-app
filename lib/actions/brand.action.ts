"use server";

import z from "zod";

import { BrandTable, BrandWithRelations } from "@/types/prisma";

import { Brand } from "../generated/prisma";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError } from "../http-errors";
import { generateSlug } from "../utils/slug";
import { BrandInput, brandSchema } from "../validations/brand.validation";

export async function createBrand(
  params: BrandInput,
): Promise<ActionResponse<Brand>> {
  const validationResult = await action({
    params,
    schema: brandSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { name, description, logo, isActive } = validationResult.params!;

  const prisma = validationResult.prisma;

  try {
    const slug = generateSlug(name);

    const existingBrand = await prisma.brand.findUnique({
      where: { slug },
    });

    if (existingBrand) throw new Error("Brand already exists");

    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        description,
        logo,
        isActive,
      },
    });

    return { success: true, data: brand };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateBrand(
  params: Partial<BrandInput>,
): Promise<ActionResponse<Brand>> {
  const validationResult = await action({
    params,
    schema: brandSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { name, description, logo, isActive, id } = validationResult.params!;

  const prisma = validationResult.prisma;

  try {
    if (!id) throw new Error("Provide a valid brand id");

    const existingBrand = await prisma.brand.findUnique({
      where: { id },
    });

    if (!existingBrand) throw new NotFoundError("Brand");

    let slug = existingBrand.slug;
    if (name && name !== existingBrand.name) {
      slug = generateSlug(name);
    }

    const slugExists = await prisma.brand.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });

    if (slugExists) throw new Error("A brand with this name already exists");

    const updatedBrand = await prisma.brand.update({
      where: { id },
      data: {
        name: name || existingBrand.name,
        slug,
        description:
          description !== undefined ? description : existingBrand.description,
        logo: logo !== undefined ? logo : existingBrand.logo,
        isActive: isActive !== undefined ? isActive : existingBrand.isActive,
      },
    });

    return { success: true, data: updatedBrand };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getBrandBySlug(
  slug: string,
): Promise<ActionResponse<BrandWithRelations>> {
  const validationResult = await action({
    params: { slug },
    schema: z.object({ slug: z.string().min(1) }),
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const brand = await prisma.brand.findUnique({
      where: { slug },
      include: {
        products: true,
        promotions: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) throw new NotFoundError("Brand");

    return {
      success: true,
      data: brand,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getAllBrands(
  includeInactive = false,
): Promise<ActionResponse<(BrandWithRelations & BrandTable)[]>> {
  const validationResult = await action({
    params: { includeInactive },
    schema: z.object({ includeInactive: z.boolean() }),
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const brands = await prisma.brand.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        products: true,
        promotions: true,
        _count: {
          select: { products: true },
        },
      },
    });

    return { success: true, data: brands };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
