import z from "zod";

export const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(200),
  slug: z.string().optional(),
  description: z.string().optional(),
  logo: z.url().optional().nullable(),

  isActive: z.boolean(),

  id: z.string().optional(),
});

export type BrandInput = z.infer<typeof brandSchema>;
