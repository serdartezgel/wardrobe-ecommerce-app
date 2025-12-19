import { StarIcon } from "lucide-react";
import Link from "next/link";

import ReviewAdminCard from "@/components/cards/ReviewAdminCard";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/animate-ui/components/animate/tabs";
import { Badge } from "@/components/ui/badge";
import {
  getAllReviews,
  getReviewStatistics,
} from "@/lib/actions/review.action";

const DashboardReviewsPage = async ({ searchParams }: RouteParams) => {
  const params = await searchParams;
  const rating = params.rating ? parseInt(params.rating) : undefined;
  const verified =
    params.verified === "true"
      ? true
      : params.verified === "false"
        ? false
        : undefined;

  const [reviewsResult, statsResult] = await Promise.all([
    getAllReviews({ rating, isVerified: verified }),
    getReviewStatistics(),
  ]);

  const reviews = reviewsResult.success ? reviewsResult.data : [];
  const stats = statsResult.success ? statsResult.data : null;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold">Review Management</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and manage customer reviews
        </p>
      </header>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">Total Reviews</p>
            <p className="mt-1 text-2xl font-bold">{stats.totalReviews}</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">Average Rating</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-2xl font-bold">
                {stats.averageRating.toFixed(1)}
              </p>
              <StarIcon className="size-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">Verified Reviews</p>
            <p className="mt-1 text-2xl font-bold">{stats.verifiedCount}</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">Last 30 Days</p>
            <p className="mt-1 text-2xl font-bold">{stats.recentReviews}</p>
          </div>
        </div>
      )}

      {stats && (
        <div className="bg-card rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">Rating Distribution</h2>
          <div className="space-y-3">
            {stats.ratingDistribution.map((item) => {
              const percentage =
                stats.totalReviews > 0
                  ? (item.count / stats.totalReviews) * 100
                  : 0;

              return (
                <div key={item.rating} className="flex items-center gap-3">
                  <div className="flex w-16 items-center gap-1">
                    <span className="text-sm font-medium">{item.rating}</span>
                    <StarIcon className="size-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="bg-muted relative h-4 flex-1 overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground w-16 text-right text-sm">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Tabs defaultValue="all">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="all" asChild>
              <Link href="/dashboard/reviews">All</Link>
            </TabsTrigger>
            <TabsTrigger value="5" asChild>
              <Link href="/dashboard/reviews?rating=5">5 Stars</Link>
            </TabsTrigger>
            <TabsTrigger value="4" asChild>
              <Link href="/dashboard/reviews?rating=4">4 Stars</Link>
            </TabsTrigger>
            <TabsTrigger value="3" asChild>
              <Link href="/dashboard/reviews?rating=3">3 Stars</Link>
            </TabsTrigger>
            <TabsTrigger value="2" asChild>
              <Link href="/dashboard/reviews?rating=2">2 Stars</Link>
            </TabsTrigger>
            <TabsTrigger value="1" asChild>
              <Link href="/dashboard/reviews?rating=1">1 Star</Link>
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Badge
              variant={verified === true ? "default" : "outline"}
              className="cursor-pointer"
              asChild
            >
              <Link href="/dashboard/reviews?verified=true">Verified</Link>
            </Badge>
            <Badge
              variant={verified === false ? "destructive" : "outline"}
              className="cursor-pointer"
              asChild
            >
              <Link href="/dashboard/reviews?verified=false">Unverified</Link>
            </Badge>
            {(verified !== undefined || rating) && (
              <Badge variant="secondary" className="cursor-pointer" asChild>
                <Link href="/dashboard/reviews">Clear Filters</Link>
              </Badge>
            )}
          </div>
        </div>
      </Tabs>

      {!reviews || reviews.length === 0 ? (
        <div className="bg-card flex flex-col items-center justify-center rounded-lg border p-12 text-center">
          <StarIcon className="text-muted-foreground mb-4 size-16" />
          <h3 className="mb-2 text-lg font-semibold">No reviews found</h3>
          <p className="text-muted-foreground text-sm">
            {rating || verified !== undefined
              ? "Try adjusting your filters"
              : "Reviews will appear here once customers start leaving feedback"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewAdminCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardReviewsPage;
