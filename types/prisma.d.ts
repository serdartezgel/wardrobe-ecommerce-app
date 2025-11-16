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

export type CategoryWithChildren = Prisma.CategoryGetPayload<{
  include: {
    children: {
      include: { children: true };
    };
  };
}>;

export type BrandWithRelations = Prisma.BrandGetPayload<{
  include: {
    products: true;
    promotions: true;
  };
}>;

export type BrandTable = Prisma.BrandGetPayload<{
  include: {
    _count: {
      select: { products: true };
    };
  };
}>;
