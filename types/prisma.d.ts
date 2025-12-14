import {
  Address,
  Order,
  OrderItem,
  Prisma,
  Product,
  ProductImage,
  ProductOption,
  ProductVariant,
  Review,
  User,
  VariantOption,
} from "@/lib/generated/prisma";

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

export type LowStockVariant = ProductVariant & {
  product: {
    name: string;
    slug: string;
    images: ProductImage[];
  };
  variantOptions: (VariantOption & {
    option: ProductOption;
  })[];
};

export type OutOfStockVariant = ProductVariant & {
  product: {
    name: string;
    slug: string;
    images: ProductImage[];
  };
  variantOptions: (VariantOption & {
    option: ProductOption;
  })[];
};

export type InventoryLogWithRelations = Prisma.InventoryLogGetPayload<{
  include: {
    variant: { include: { variantOptions: true; product: true } };
    admin: { select: { name: true; id: true } };
  };
}>;

export type OrderWithRelations = Order & {
  user: Pick<User, "id" | "name" | "email" | "image">;
  shippingAddress: Address;
  items: (OrderItem & {
    productVariant: ProductVariant & {
      product: Product & {
        images: ProductImage[];
      };
      variantOptions: (VariantOption & {
        option: ProductOption;
      })[];
    };
  })[];
  reviews: Review[];
};

export type OrderListItem = Order & {
  user: Pick<User, "id" | "name" | "email">;
  items: {
    id: string;
    quantity: number;
  }[];
};
