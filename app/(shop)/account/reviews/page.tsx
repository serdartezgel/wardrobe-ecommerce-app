import { StarIcon } from "lucide-react";

import PendingReviewCard from "@/components/cards/PendingReviewCard";
import ReviewCard from "@/components/cards/ReviewCard";
import { Separator } from "@/components/ui/separator";
import { getUserReviews, getPendingReviews } from "@/lib/actions/review.action";

const CustomerReviewsPage = async () => {
  const [reviewsResult, pendingResult] = await Promise.all([
    getUserReviews(),
    getPendingReviews(),
  ]);

  const reviews = reviewsResult.success ? reviewsResult.data : [];
  const pending = pendingResult.success ? pendingResult.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Reviews</h1>
        <p className="text-muted-foreground mt-2">
          Manage your product reviews and ratings
        </p>
      </div>

      {pending && pending.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              Waiting for Review ({pending.length})
            </h2>
            <p className="text-muted-foreground text-sm">
              Share your experience with products you&apos;ve received
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map((item) => (
              <PendingReviewCard
                key={`${item.orderId}-${item.productId}`}
                item={item}
              />
            ))}
          </div>

          <Separator className="my-6" />
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Your Reviews ({reviews && reviews.length})
        </h2>

        {!reviews || reviews.length === 0 ? (
          <div className="bg-card flex flex-col items-center justify-center rounded-lg border p-12 text-center">
            <StarIcon className="text-muted-foreground mb-4 size-16" />
            <h3 className="mb-2 text-lg font-semibold">No reviews yet</h3>
            <p className="text-muted-foreground text-sm">
              {pending && pending.length > 0
                ? "Start by reviewing the products above"
                : "Reviews will appear here after you receive and review your orders"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerReviewsPage;
