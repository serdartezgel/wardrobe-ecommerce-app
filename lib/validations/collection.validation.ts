import z from "zod";

export const collectionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional(),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  type: z.enum([
    "MANUAL",
    "AUTOMATIC",
    "SEASONAL",
    "DEAL",
    "NEW_ARRIVAL",
    "BESTSELLER",
  ]),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  order: z.number(),
  rules: z.string().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  publishedAt: z.string().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
});

export type CollectionInput = z.infer<typeof collectionSchema>;
