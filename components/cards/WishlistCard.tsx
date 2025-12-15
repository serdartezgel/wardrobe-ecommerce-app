"use client";

import { HeartMinusIcon, PackageIcon, ShoppingCartIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { removeFromWishlist } from "@/lib/actions/wishlist.action";
import { formatPrice } from "@/lib/utils/price";
import { WishlistWithProduct } from "@/types/prisma";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const WishlistCard = ({
  wishlistItem,
}: {
  wishlistItem: WishlistWithProduct;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { product } = wishlistItem;

  const imageUrl = product.images[0]?.url;
  const isOutOfStock = !product.isActive;

  const handleRemove = () => {
    startTransition(async () => {
      const result = await removeFromWishlist(product.id);

      if (result.success) {
        toast.success("Removed from wishlist");
        router.refresh();
      } else {
        toast.error(result.error?.message || "Failed to remove from wishlist");
      }
    });
  };
  return (
    <div className="bg-card group relative flex flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-md">
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square"
      >
        <div className="bg-muted relative size-full overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <PackageIcon className="text-muted-foreground size-16" />
            </div>
          )}
        </div>

        {isOutOfStock && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            Out of Stock
          </Badge>
        )}

        {product.isFeatured && !isOutOfStock && (
          <Badge className="absolute top-2 left-2">Featured</Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <Link href={`/products/${product.slug}`} className="group/link block">
            <p className="text-muted-foreground text-xs">
              {product.brand.name}
            </p>
            <h3 className="mt-1 line-clamp-2 font-medium group-hover/link:underline">
              {product.name}
            </h3>
          </Link>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold">
              {formatPrice(product.basePriceCents)}
            </span>
          </div>

          <p className="text-muted-foreground mt-1 text-xs">
            {product.category.name}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={isOutOfStock}
            asChild={!isOutOfStock}
          >
            {isOutOfStock ? (
              <>Out of Stock</>
            ) : (
              <Link href={`/products/${product.slug}`}>
                <ShoppingCartIcon className="mr-2 size-3.5" />
                View Product
              </Link>
            )}
          </Button>

          <Button
            variant="destructive"
            size="icon-sm"
            onClick={handleRemove}
            disabled={isPending}
            className="shrink-0 cursor-pointer"
          >
            <HeartMinusIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
