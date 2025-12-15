import z from "zod";

export const reviewSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1),
  orderId: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
