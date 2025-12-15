import { HeartIcon, ShoppingBagIcon } from "lucide-react";
import Link from "next/link";

import WishlistCard from "@/components/cards/WishlistCard";
import { Button } from "@/components/ui/button";
import { getUserWishlist } from "@/lib/actions/wishlist.action";

const CustomerWishlistPage = async () => {
  const result = await getUserWishlist();

  const wishlist = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground mt-2">
            {wishlist && wishlist.length}{" "}
            {wishlist && wishlist.length === 1 ? "item" : "items"} saved
          </p>
        </div>
      </div>

      {!wishlist || wishlist.length === 0 ? (
        <div className="bg-card flex flex-col items-center justify-center rounded-lg border p-12 text-center">
          <HeartIcon className="text-muted-foreground mb-4 size-16" />
          <h3 className="mb-2 text-lg font-semibold">Your wishlist is empty</h3>
          <p className="text-muted-foreground mb-6 text-sm">
            Save your favorite products to buy them later
          </p>
          <Button asChild>
            <Link href="/">
              <ShoppingBagIcon className="mr-2 size-4" />
              Start Shopping
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => (
            <WishlistCard key={item.id} wishlistItem={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerWishlistPage;
