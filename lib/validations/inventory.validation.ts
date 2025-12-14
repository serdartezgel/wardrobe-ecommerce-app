import z from "zod";

export const adjustInventorySchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  change: z.number().int(),
  type: z.enum([
    "ORDER_PLACED",
    "ORDER_CANCELLED",
    "MANUAL_ADJUSTMENT",
    "RESTOCK",
    "DAMAGED_LOST",
  ]),
  note: z.string().optional(),
  orderId: z.string().optional(),
});

export const bulkAdjustInventorySchema = z.object({
  adjustments: z.array(
    z.object({
      variantId: z.string(),
      change: z.number().int(),
      note: z.string().optional(),
    }),
  ),
  type: z.enum([
    "ORDER_PLACED",
    "ORDER_CANCELLED",
    "RESTOCK",
    "MANUAL_ADJUSTMENT",
    "DAMAGED_LOST",
  ]),
});

export const getInventoryLogsSchema = z.object({
  variantId: z.string().optional(),
  productId: z.string().optional(),
  type: z
    .enum([
      "ORDER_PLACED",
      "ORDER_CANCELLED",
      "MANUAL_ADJUSTMENT",
      "RESTOCK",
      "DAMAGED_LOST",
    ])
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
