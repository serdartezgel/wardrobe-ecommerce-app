import { format } from "date-fns";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import PromotionForm from "@/components/forms/PromotionForm";
import { Button } from "@/components/ui/button";
import { getAllBrands } from "@/lib/actions/brand.action";
import { getAllCategories } from "@/lib/actions/category.action";
import { getAllCollections } from "@/lib/actions/collection.action";
import { getAllProducts } from "@/lib/actions/product.action";
import { getPromotionById } from "@/lib/actions/promotion.action";

const EditPromotionPage = async ({ params }: RouteParams) => {
  const { promotionId } = await params;
  const [
    promotionResult,
    categoriesResult,
    brandsResult,
    productsResult,
    collectionsResult,
  ] = await Promise.all([
    getPromotionById(promotionId),
    getAllCategories(false),
    getAllBrands(false),
    getAllProducts(false),
    getAllCollections(false),
  ]);

  if (!promotionResult.success || !promotionResult.data) {
    notFound();
  }

  const promotion = promotionResult.data;

  return (
    <div className="flex flex-col gap-4">
      <Button variant="link" size="sm" asChild className="w-fit gap-2">
        <Link href="/dashboard/deals-coupons?tab=promotions">
          <ChevronLeftIcon className="size-4" />
          Back to Promotions
        </Link>
      </Button>

      <header>
        <h1 className="text-3xl font-bold">Edit Promotion</h1>
        <p className="text-muted-foreground mt-1">
          Update the promotional offer for your customers
        </p>
      </header>

      <div className="bg-card rounded-lg border p-6">
        <PromotionForm
          initialData={{
            ...promotion,
            code: promotion.code ? promotion.code : "",
            discountType: promotion.discountType
              ? promotion.discountType
              : undefined,
            discountValueCents: promotion.discountValueCents
              ? promotion.discountValueCents
              : undefined,
            minPurchaseCents: promotion.minPurchaseCents
              ? promotion.minPurchaseCents
              : undefined,
            minQuantity: promotion.minQuantity
              ? promotion.minQuantity
              : undefined,
            maxDiscountCents: promotion.maxDiscountCents
              ? promotion.maxDiscountCents
              : undefined,
            bogoConfig: promotion.bogoConfig ? promotion.bogoConfig : undefined,
            usageLimit: promotion.usageLimit ? promotion.usageLimit : undefined,
            usagePerCustomer: promotion.usagePerCustomer
              ? promotion.usagePerCustomer
              : undefined,
            validFrom: promotion.validFrom
              ? format(new Date(promotion.validFrom), "yyyy-MM-dd")
              : "",
            validUntil: promotion.validUntil
              ? format(new Date(promotion.validUntil), "yyyy-MM-dd")
              : "",
            categoryIds:
              promotion.applicableCategories?.map((c) => c.categoryId) ?? [],
            brandIds: promotion.applicableBrands?.map((b) => b.brandId) ?? [],
            productIds:
              promotion.applicableProducts?.map((p) => p.productId) ?? [],
            collectionIds:
              promotion.applicableCollections?.map((c) => c.collectionId) ?? [],
          }}
          isEditing
          categories={categoriesResult.data || []}
          brands={brandsResult.data || []}
          products={productsResult.data || []}
          collections={collectionsResult.data || []}
        />
      </div>
    </div>
  );
};

export default EditPromotionPage;
