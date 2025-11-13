import { Prisma } from "@/lib/generated/prisma";

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    brand: true;
    category: true;
    variants: true;
    images: true;
    productOptions: true;
  };
}>;
