import z from "zod";

export const couponSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  valueCents: z.number().min(1, "Value must be greater than 0"),
  minPurchaseCents: z.number().optional(),
  maxDiscountCents: z.number().optional(),
  usageLimit: z.number().optional(),
  validFrom: z.string().min(1, "Valid from date is required"),
  validUntil: z.string().min(1, "Valid until date is required"),
  isActive: z.boolean(),
  collectionIds: z.array(z.string()).optional(),
});

export type CouponInput = z.infer<typeof couponSchema>;
