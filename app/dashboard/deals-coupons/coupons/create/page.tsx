import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";

import CouponForm from "@/components/forms/CouponForm";
import { Button } from "@/components/ui/button";
import { getAllCollections } from "@/lib/actions/collection.action";

const CreateCouponPage = async () => {
  const collectionsResult = await getAllCollections(false);

  return (
    <div className="flex flex-col gap-4">
      <Button variant="link" size="sm" asChild className="w-fit gap-2">
        <Link href="/dashboard/deals-coupons?tab=coupons">
          <ChevronLeftIcon className="size-4" />
          Back to Coupons
        </Link>
      </Button>

      <header>
        <h1 className="text-3xl font-bold">Create Coupon</h1>
        <p className="text-muted-foreground mt-1">
          Create a new coupon code for customers
        </p>
      </header>

      <div className="bg-card rounded-lg border p-6">
        <CouponForm collections={collectionsResult.data || []} />
      </div>
    </div>
  );
};

export default CreateCouponPage;
