import { format } from "date-fns";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import CouponForm from "@/components/forms/CouponForm";
import { Button } from "@/components/ui/button";
import { getAllCollections } from "@/lib/actions/collection.action";
import { getCouponById } from "@/lib/actions/coupon.action";

const EditCouponPage = async ({ params }: RouteParams) => {
  const { couponId } = await params;
  const [couponResult, collectionsResult] = await Promise.all([
    getCouponById(couponId),
    getAllCollections(false),
  ]);

  if (!couponResult.success || !couponResult.data) {
    notFound();
  }

  const coupon = couponResult.data;

  return (
    <div className="flex flex-col gap-4">
      <Button variant="link" size="sm" asChild className="w-fit gap-2">
        <Link href="/dashboard/deals-coupons?tab=coupons">
          <ChevronLeftIcon className="size-4" />
          Back to Coupons
        </Link>
      </Button>

      <header>
        <h1 className="text-3xl font-bold">Edit Coupon</h1>
        <p className="text-muted-foreground mt-1">
          Update the coupon offer for your customers
        </p>
      </header>

      <div className="bg-card rounded-lg border p-6">
        <CouponForm
          initialData={{
            ...coupon,
            minPurchaseCents: coupon.minPurchaseCents
              ? coupon.minPurchaseCents
              : undefined,
            maxDiscountCents: coupon.maxDiscountCents
              ? coupon.maxDiscountCents
              : undefined,
            usageLimit: coupon.usageLimit ? coupon.usageLimit : undefined,
            validFrom: coupon.validFrom
              ? format(new Date(coupon.validFrom), "yyyy-MM-dd")
              : "",
            validUntil: coupon.validUntil
              ? format(new Date(coupon.validUntil), "yyyy-MM-dd")
              : "",
            collectionIds: coupon.collections.map((c) => c.collectionId),
          }}
          isEditing
          collections={collectionsResult.data || []}
        />
      </div>
    </div>
  );
};

export default EditCouponPage;
