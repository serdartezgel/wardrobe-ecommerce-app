import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";

import PromotionForm from "@/components/forms/PromotionForm";
import { Button } from "@/components/ui/button";
import { getAllBrands } from "@/lib/actions/brand.action";
import { getAllCategories } from "@/lib/actions/category.action";
import { getAllCollections } from "@/lib/actions/collection.action";
import { getAllProducts } from "@/lib/actions/product.action";

const CreatePromotionPage = async () => {
  const [categoriesResult, brandsResult, productsResult, collectionsResult] =
    await Promise.all([
      getAllCategories(false),
      getAllBrands(false),
      getAllProducts(false),
      getAllCollections(false),
    ]);

  return (
    <div className="flex flex-col gap-4">
      <Button variant="link" size="sm" asChild className="w-fit gap-2">
        <Link href="/dashboard/deals-coupons?tab=promotions">
          <ChevronLeftIcon className="size-4" />
          Back to Promotions
        </Link>
      </Button>

      <header>
        <h1 className="text-3xl font-bold">Create Promotion</h1>
        <p className="text-muted-foreground mt-1">
          Set up a new promotional offer for your customers
        </p>
      </header>

      <div className="bg-card rounded-lg border p-6">
        <PromotionForm
          categories={categoriesResult.data || []}
          brands={brandsResult.data || []}
          products={productsResult.data || []}
          collections={collectionsResult.data || []}
        />
      </div>
    </div>
  );
};

export default CreatePromotionPage;
