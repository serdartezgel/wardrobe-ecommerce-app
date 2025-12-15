import z from "zod";

export const addressSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  addressLine1: z.string().min(5, "Address line 1 is required"),
  addressLine2: z.string().nullable().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
  isDefault: z.boolean(),
});

export const updateAddressSchema = addressSchema.partial().extend({
  id: z.string(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
