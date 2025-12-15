import { z } from "zod";

export const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.url("Invalid image URL"),
  altText: z.string().optional(),
  order: z.number().int().min(0),
});

export const productOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Option name is required").max(50),
  values: z.array(z.string().min(1)).min(1, "At least one value is required"),
});

export const variantOptionSchema = z.object({
  optionId: z.string(),
  optionName: z.string(),
  value: z.string(),
});

export const productVariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  priceCents: z.number().positive("Price must be positive"),
  compareAtPriceCents: z.number().min(0).optional().nullable(),
  image: z.url().optional().nullable(),
  variantOptions: z
    .array(variantOptionSchema)
    .min(1, "At least one variant option required"),
});

export const productSchema = z
  .object({
    // Basic Information
    name: z.string().min(1, "Product name is required").max(200),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    slug: z.string().optional(), // Auto-generated from name
    categoryId: z.string().min(1, "Category is required"),
    brandId: z.string().min(1, "Brand is required"),
    basePriceCents: z
      .string()
      .min(1, "Base price is required")
      .refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
        "Base price must be a positive number",
      ),
    tags: z
      .array(z.string().max(15))
      .min(1, "At least one tag is required")
      .max(5, "Maximum 5 tags allowed"),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),

    // SEO
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),

    // Images
    images: z
      .array(productImageSchema)
      .min(1, "At least one product image is required")
      .max(8, "You can add a maximum of 8 images"),

    // Options (Size, Color, etc.)
    productOptions: z
      .array(productOptionSchema)
      .min(1, "At least one product option is required"),

    // Variants
    variants: z
      .array(productVariantSchema)
      .min(1, "At least one product variant is required"),

    // For Update
    id: z.string().min(1, "Product ID is required").optional(),
  })
  .refine(
    (data) => {
      const optionNames = data.productOptions.map((opt) => opt.name);
      return data.variants.every(
        (variant) => variant.variantOptions.length === optionNames.length,
      );
    },
    {
      message: "Each variant must have values for all options",
    },
  );

export type ProductInput = z.infer<typeof productSchema>;
export type ProductImage = z.infer<typeof productImageSchema>;
export type ProductOption = z.infer<typeof productOptionSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type VariantOption = z.infer<typeof variantOptionSchema>;
