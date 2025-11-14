import z from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(200),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.url().optional().nullable(),

  isActive: z.boolean(),
  order: z.number().int(),

  parentId: z.string().optional().nullable(),

  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),

  id: z.string().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
