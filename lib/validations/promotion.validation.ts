import z from "zod";

export const promotionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().optional(),
  type: z.enum([
    "PRODUCT_DISCOUNT",
    "FREE_SHIPPING",
    "BOGO",
    "BUNDLE",
    "CART_DISCOUNT",
  ]),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).optional(),
  discountValueCents: z.number().optional(),
  minPurchaseCents: z.number().optional(),
  minQuantity: z.number().optional(),
  maxDiscountCents: z.number().optional(),
  bogoConfig: z.string().optional(),
  usageLimit: z.number().optional(),
  usagePerCustomer: z.number().optional(),
  validFrom: z.string().min(1, "Valid from date is required"),
  validUntil: z.string().min(1, "Valid until date is required"),
  isActive: z.boolean(),
  applyToAllProducts: z.boolean(),
  excludeSaleItems: z.boolean(),

  categoryIds: z.array(z.string()).optional(),
  brandIds: z.array(z.string()).optional(),
  productIds: z.array(z.string()).optional(),
  collectionIds: z.array(z.string()).optional(),
});

export type PromotionInput = z.infer<typeof promotionSchema>;
