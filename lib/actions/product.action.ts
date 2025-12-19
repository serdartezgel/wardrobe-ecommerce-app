"use server";

import { revalidatePath } from "next/cache";
import z from "zod";

import { ProductWithRelations } from "@/types/prisma";

import { bulkDeleteFromCloudinary } from "./image.action";
import { Product } from "../generated/prisma";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError } from "../http-errors";
import { extractPublicIdFromUrl } from "../utils/image";
import { toCents } from "../utils/price";
import { generateSlug } from "../utils/slug";
import { ProductInput, productSchema } from "../validations/product.validation";

export async function createProduct(
  params: ProductInput,
): Promise<ActionResponse<Product>> {
  const validationResult = await action({
    params,
    schema: productSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    name,
    description,
    categoryId,
    brandId,
    basePriceCents,
    tags,
    isActive,
    isFeatured,
    status,
    metaTitle,
    metaDescription,
    images,
    productOptions,
    variants,
  } = validationResult.params!;

  const prisma = validationResult.prisma;
  const userId = validationResult.session?.user.id;

  try {
    const slug = generateSlug(name);

    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      throw new Error("A product with this name already exists");
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundError("Category");
    }

    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      throw new NotFoundError("Brand");
    }

    const skus = variants.map((v) => v.sku);
    const uniqueSkus = new Set(skus);

    if (skus.length !== uniqueSkus.size) {
      throw new Error("All variant SKUs must be unique");
    }

    const existingSkus = await prisma.productVariant.findMany({
      where: {
        sku: { in: skus },
      },
      select: { sku: true },
    });

    if (existingSkus.length > 0) {
      throw new Error(
        `SKU(s) already exist: ${existingSkus.map((s) => s.sku).join(", ")}`,
      );
    }

    const basePriceNumber =
      typeof basePriceCents === "string"
        ? toCents(Number(basePriceCents))
        : toCents(basePriceCents);

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name,
          slug,
          description,
          categoryId,
          brandId,
          basePriceCents: basePriceNumber,
          tags,
          isActive,
          isFeatured,
          status,
          metaTitle: metaTitle || name,
          metaDescription: metaDescription || description,
        },
      });

      await tx.productImage.createMany({
        data: images.map((img, index) => ({
          productId: newProduct.id,
          url: img.url,
          altText: img.altText || name,
          order: index,
        })),
      });

      const createdOptions = await Promise.all(
        productOptions.map((option) =>
          tx.productOption.create({
            data: {
              productId: newProduct.id,
              name: option.name,
              values: option.values,
            },
          }),
        ),
      );

      const optionMap = new Map(
        createdOptions.map((opt) => [opt.name, opt.id]),
      );

      for (const variant of variants) {
        const createdVariant = await tx.productVariant.create({
          data: {
            productId: newProduct.id,
            sku: variant.sku,
            stock: variant.stock,
            priceCents: toCents(variant.priceCents),
            compareAtPriceCents: toCents(variant.compareAtPriceCents ?? 0),
            image: variant.image,
          },
        });

        for (const variantOption of variant.variantOptions) {
          const optionId = optionMap.get(variantOption.optionName);

          if (!optionId) {
            throw new Error(`Option ${variantOption.optionName} not found`);
          }

          await tx.variantOption.create({
            data: {
              variantId: createdVariant.id,
              optionId,
              value: variantOption.value,
            },
          });
        }

        if (variant.stock > 0) {
          await tx.inventoryLog.create({
            data: {
              variantId: createdVariant.id,
              change: variant.stock,
              resultingStock: variant.stock,
              type: "RESTOCK",
              adminId: userId,
              note: "Initial stock",
            },
          });
        }
      }

      return newProduct;
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/products");

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateProduct(
  params: Partial<ProductInput>,
): Promise<ActionResponse<Product>> {
  const validationResult = await action({
    params,
    schema: productSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { id, ...updateData } = validationResult.params!;

  const prisma = validationResult.prisma;
  const userId = validationResult.session?.user.id;

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        productOptions: true,
        variants: {
          include: {
            variantOptions: true,
            orderItems: true,
          },
        },
      },
    });

    if (!existingProduct) {
      throw new NotFoundError("Product");
    }

    let slug = existingProduct.slug;
    if (updateData.name && updateData.name !== existingProduct.name) {
      slug = generateSlug(updateData.name);

      const slugExists = await prisma.product.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });

      if (slugExists) {
        throw new Error("A product with this name already exists");
      }
    }

    if (
      updateData.categoryId &&
      updateData.categoryId !== existingProduct.categoryId
    ) {
      const category = await prisma.category.findUnique({
        where: { id: updateData.categoryId },
      });

      if (!category) {
        throw new NotFoundError("Category");
      }
    }

    if (updateData.brandId && updateData.brandId !== existingProduct.brandId) {
      const brand = await prisma.brand.findUnique({
        where: { id: updateData.brandId },
      });

      if (!brand) {
        throw new NotFoundError("Brand");
      }
    }

    if (updateData.variants) {
      const skus = updateData.variants.map((v) => v.sku);
      const uniqueSkus = new Set(skus);

      if (skus.length !== uniqueSkus.size) {
        throw new Error("All variant SKUs must be unique");
      }

      const existingSkus = await prisma.productVariant.findMany({
        where: {
          sku: { in: skus },
          product: {
            id: { not: id },
          },
        },
        select: { sku: true },
      });

      if (existingSkus.length > 0) {
        throw new Error(
          `SKU(s) already exist: ${existingSkus.map((s) => s.sku).join(", ")}`,
        );
      }
    }

    const basePriceNumber = updateData.basePriceCents
      ? typeof updateData.basePriceCents === "string"
        ? toCents(Number(updateData.basePriceCents))
        : toCents(updateData.basePriceCents)
      : undefined;

    const product = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          name: updateData.name,
          slug: updateData.name ? slug : undefined,
          description: updateData.description,
          categoryId: updateData.categoryId,
          brandId: updateData.brandId,
          basePriceCents: basePriceNumber,
          tags: updateData.tags,
          isActive: updateData.isActive,
          isFeatured: updateData.isFeatured,
          status: updateData.status,
          metaTitle: updateData.metaTitle,
          metaDescription: updateData.metaDescription,
        },
      });

      if (updateData.images) {
        // Extract public IDs from old images
        const oldImageUrls = existingProduct.images.map((img) => img.url);
        const publicIdsToDelete = oldImageUrls
          .map(extractPublicIdFromUrl)
          .filter((id): id is string => id !== null);

        // Delete from Cloudinary
        if (publicIdsToDelete.length > 0) {
          bulkDeleteFromCloudinary(publicIdsToDelete).catch((error) => {
            console.error("Failed to delete images from Cloudinary:", error);
          });
        }

        // Delete from database
        await tx.productImage.deleteMany({
          where: { productId: id },
        });

        // Create new images
        await tx.productImage.createMany({
          data: updateData.images.map((img, index) => ({
            productId: id!,
            url: img.url,
            altText: img.altText || updatedProduct.name,
            order: index,
          })),
        });
      }

      if (updateData.productOptions && updateData.variants) {
        const incomingSkus = new Set(updateData.variants.map((v) => v.sku));

        const variantsToDelete = existingProduct.variants.filter(
          (v) => !incomingSkus.has(v.sku),
        );

        const deletableVariants = variantsToDelete.filter(
          (v) => !v.orderItems || v.orderItems.length === 0,
        );

        if (deletableVariants.length > 0) {
          await tx.variantOption.deleteMany({
            where: {
              variantId: {
                in: deletableVariants.map((v) => v.id),
              },
            },
          });

          await tx.productVariant.deleteMany({
            where: {
              id: {
                in: deletableVariants.map((v) => v.id),
              },
            },
          });
        }

        await tx.productOption.deleteMany({
          where: { productId: id },
        });

        const createdOptions = await Promise.all(
          updateData.productOptions.map((option) =>
            tx.productOption.create({
              data: {
                productId: id!,
                name: option.name,
                values: option.values,
              },
            }),
          ),
        );

        const optionMap = new Map(
          createdOptions.map((opt) => [opt.name, opt.id]),
        );

        for (const variant of updateData.variants) {
          const existingVariant = existingProduct.variants.find(
            (v) => v.sku === variant.sku,
          );

          if (existingVariant) {
            await tx.productVariant.update({
              where: { id: existingVariant.id },
              data: {
                stock: variant.stock,
                priceCents: toCents(variant.priceCents),
                compareAtPriceCents: toCents(variant.compareAtPriceCents ?? 0),
                image: variant.image,
              },
            });

            await tx.variantOption.deleteMany({
              where: { variantId: existingVariant.id },
            });

            for (const variantOption of variant.variantOptions) {
              const optionId = optionMap.get(variantOption.optionName);

              if (!optionId) {
                throw new Error(`Option ${variantOption.optionName} not found`);
              }

              await tx.variantOption.create({
                data: {
                  variantId: existingVariant.id,
                  optionId,
                  value: variantOption.value,
                },
              });
            }

            if (existingVariant.stock !== variant.stock) {
              const change = variant.stock - existingVariant.stock;
              await tx.inventoryLog.create({
                data: {
                  variantId: existingVariant.id,
                  change,
                  resultingStock: variant.stock,
                  type: change > 0 ? "RESTOCK" : "MANUAL_ADJUSTMENT",
                  adminId: userId,
                  note: "Stock updated via product edit",
                },
              });
            }
          } else {
            const createdVariant = await tx.productVariant.create({
              data: {
                productId: id!,
                sku: variant.sku,
                stock: variant.stock,
                priceCents: toCents(variant.priceCents),
                compareAtPriceCents: toCents(variant.compareAtPriceCents ?? 0),
                image: variant.image,
              },
            });

            for (const variantOption of variant.variantOptions) {
              const optionId = optionMap.get(variantOption.optionName);

              if (!optionId) {
                throw new Error(`Option ${variantOption.optionName} not found`);
              }

              await tx.variantOption.create({
                data: {
                  variantId: createdVariant.id,
                  optionId,
                  value: variantOption.value,
                },
              });
            }

            await tx.inventoryLog.create({
              data: {
                variantId: createdVariant.id,
                change: variant.stock,
                resultingStock: variant.stock,
                type: "RESTOCK",
                adminId: userId,
                note: "Variant created via product edit",
              },
            });
          }
        }
      }

      return updatedProduct;
    });

    revalidatePath("/dashboard/products");
    revalidatePath(`/dashboard/products/${id}`);
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteProduct(
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
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        _count: {
          select: {
            reviews: true,
            wishlists: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError("Product");
    }

    const hasOrders = await prisma.orderItem.findFirst({
      where: {
        productVariant: {
          productId: id,
        },
      },
    });

    if (hasOrders) {
      throw new Error(
        "Cannot delete product that has been ordered. Consider deactivating instead.",
      );
    }

    const imageUrls = product.images.map((img) => img.url);
    const publicIdsToDelete = imageUrls
      .map(extractPublicIdFromUrl)
      .filter((id): id is string => id !== null);

    await prisma.product.delete({
      where: { id },
    });

    if (publicIdsToDelete.length > 0) {
      bulkDeleteFromCloudinary(publicIdsToDelete).catch((error) => {
        console.error("Failed to delete images from Cloudinary:", error);
      });
    }

    revalidatePath("/dashboard/products");
    revalidatePath("/products");

    return {
      success: true,
      data: { id },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getProductForEdit(
  slug: string,
): Promise<ActionResponse<ProductInput>> {
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
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        images: {
          orderBy: { order: "asc" },
        },
        productOptions: true,
        variants: {
          include: {
            variantOptions: {
              include: {
                option: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError("Product");
    }

    const formData: ProductInput = {
      name: product.name,
      description: product.description,
      slug: product.slug,
      categoryId: product.categoryId,
      brandId: product.brandId,
      basePriceCents: product.basePriceCents.toString(),
      tags: product.tags,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      status: product.status,
      metaTitle: product.metaTitle || "",
      metaDescription: product.metaDescription || "",
      images: product.images.map((img) => ({
        url: img.url,
        altText: img.altText || "",
        order: img.order,
      })),
      productOptions: product.productOptions.map((opt) => ({
        name: opt.name,
        values: opt.values,
      })),
      variants: product.variants.map((variant) => ({
        sku: variant.sku,
        stock: variant.stock,
        priceCents: variant.priceCents,
        compareAtPriceCents: variant.compareAtPriceCents,
        image: variant.image,
        variantOptions: variant.variantOptions.map((vo) => ({
          optionId: vo.option.id,
          optionName: vo.option.name,
          value: vo.value,
        })),
      })),
      id: product.id,
    };

    return {
      success: true,
      data: formData,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function bulkDeleteProducts(
  ids: string[],
): Promise<ActionResponse<{ count: number }>> {
  const validationResult = await action({
    params: { ids },
    schema: z.object({
      ids: z.array(z.string()).min(1, "At least one product ID is required"),
    }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const hasOrders = await prisma.orderItem.findFirst({
      where: {
        productVariant: {
          productId: { in: ids },
        },
      },
    });

    if (hasOrders) {
      throw new Error(
        "Some products have been ordered and cannot be deleted. Consider archiving instead.",
      );
    }

    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      include: {
        images: true,
      },
    });

    const allPublicIds: string[] = [];
    products.forEach((product) => {
      product.images.forEach((img) => {
        const publicId = extractPublicIdFromUrl(img.url);
        if (publicId) {
          allPublicIds.push(publicId);
        }
      });
    });

    const result = await prisma.product.deleteMany({
      where: { id: { in: ids } },
    });

    if (allPublicIds.length > 0) {
      bulkDeleteFromCloudinary(allPublicIds).catch((error) => {
        console.error("Failed to delete images from Cloudinary:", error);
      });
    }

    revalidatePath("/dashboard/products");
    revalidatePath("/products");

    return {
      success: true,
      data: { count: result.count },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function bulkUpdateProductStatus(
  ids: string[],
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
): Promise<ActionResponse<{ count: number }>> {
  const validationResult = await action({
    params: { ids, status },
    schema: z.object({
      ids: z.array(z.string()).min(1),
      status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
    }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/products");

    return {
      success: true,
      data: { count: result.count },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getAllProducts(
  includeInactive = false,
): Promise<ActionResponse<ProductWithRelations[]>> {
  const validationResult = await action({
    params: { includeInactive },
    schema: z.object({ includeInactive: z.boolean() }),
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const products = await prisma.product.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        brand: true,
        category: true,
        variants: {
          take: 1,
          orderBy: { createdAt: "asc" },
        },
        images: true,
        productOptions: {
          select: {
            name: true,
            values: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: products as ProductWithRelations[] };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function bulkUpdateProductActiveStatus(
  ids: string[],
  isActive: boolean,
): Promise<ActionResponse<{ count: number }>> {
  const validationResult = await action({
    params: { ids, isActive },
    schema: z.object({
      ids: z.array(z.string()).min(1),
      isActive: z.boolean(),
    }),
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const prisma = validationResult.prisma;

  try {
    const result = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { isActive },
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/products");

    return {
      success: true,
      data: { count: result.count },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
