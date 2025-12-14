import { z } from "zod";

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const addTrackingNumberSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  trackingNumber: z.string().min(1, "Tracking number is required"),
});

export const cancelOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: z.string().optional(),
});

export const refundOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  amount: z.number().positive().optional(),
  reason: z.string().optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type AddTrackingNumberInput = z.infer<typeof addTrackingNumberSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type RefundOrderInput = z.infer<typeof refundOrderSchema>;
