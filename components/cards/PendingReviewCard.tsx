"use client";

import { PackageIcon, PencilIcon } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";

import ReviewDialog from "../shop/account/ReviewDialog";

type PendingReviewCardProps = {
  item: {
    orderId: string;
    orderNumber: string;
    productId: string;
    productName: string;
    productImage: string | null;
    brandName: string;
  };
};

const PendingReviewCard = ({ item }: PendingReviewCardProps) => {
  return (
    <div className="bg-card group flex flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-md">
      <div className="relative aspect-square">
        <div className="bg-muted relative size-full overflow-hidden">
          {item.productImage ? (
            <Image
              src={item.productImage}
              alt={item.productName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <PackageIcon className="text-muted-foreground size-16" />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <p className="text-muted-foreground text-xs">{item.brandName}</p>
          <h3 className="mt-1 line-clamp-2 font-medium">{item.productName}</h3>
          <p className="text-muted-foreground mt-2 text-xs">
            Order #{item.orderNumber}
          </p>
        </div>

        <ReviewDialog
          productId={item.productId}
          orderId={item.orderId}
          productName={item.productName}
        >
          <Button variant="outline" size="sm" className="w-full">
            <PencilIcon className="mr-2 size-3.5" />
            Write Review
          </Button>
        </ReviewDialog>
      </div>
    </div>
  );
};

export default PendingReviewCard;
