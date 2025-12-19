import { PlusIcon } from "lucide-react";
import Link from "next/link";

import CouponCard from "@/components/cards/CouponCard";
import PromotionCard from "@/components/cards/PromotionCard";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/ui/animate-ui/components/animate/tabs";
import { Button } from "@/components/ui/button";
import { getAllCoupons } from "@/lib/actions/coupon.action";
import { getAllPromotions } from "@/lib/actions/promotion.action";

const DealsCouponsPage = async ({ searchParams }: RouteParams) => {
  const params = await searchParams;
  const activeTab = params.tab || "promotions";
  const status = params.status as
    | "active"
    | "scheduled"
    | "expired"
    | undefined;

  const [promotionsResult, couponsResult] = await Promise.all([
    getAllPromotions(status),
    getAllCoupons(status),
  ]);

  const promotions = promotionsResult.success ? promotionsResult.data : [];
  const coupons = couponsResult.success ? couponsResult.data : [];

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deals & Coupons</h1>
          <p className="text-muted-foreground mt-1">
            Manage promotions and coupon codes
          </p>
        </div>
      </header>

      <Tabs defaultValue={activeTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="promotions" asChild>
              <Link href="/dashboard/deals-coupons?tab=promotions">
                Promotions
              </Link>
            </TabsTrigger>
            <TabsTrigger value="coupons" asChild>
              <Link href="/dashboard/deals-coupons?tab=coupons">Coupons</Link>
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/deals-coupons/coupons/create">
                <PlusIcon className="mr-2 size-4" />
                New Coupon
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/deals-coupons/promotions/create">
                <PlusIcon className="mr-2 size-4" />
                New Promotion
              </Link>
            </Button>
          </div>
        </div>

        <TabsContents>
          <TabsContent value="promotions" className="space-y-4">
            <Tabs defaultValue={status || "all"}>
              <TabsList>
                <TabsTrigger value="all" asChild>
                  <Link href="/dashboard/deals-coupons?tab=promotions">
                    All
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="active" asChild>
                  <Link href="/dashboard/deals-coupons?tab=promotions&status=active">
                    Active
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="scheduled" asChild>
                  <Link href="/dashboard/deals-coupons?tab=promotions&status=scheduled">
                    Scheduled
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="expired" asChild>
                  <Link href="/dashboard/deals-coupons?tab=promotions&status=expired">
                    Expired
                  </Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {!promotions || promotions.length === 0 ? (
              <div className="bg-card flex flex-col items-center justify-center rounded-lg border p-12 text-center">
                <h3 className="mb-2 text-lg font-semibold">
                  No promotions yet
                </h3>
                <p className="text-muted-foreground mb-6 text-sm">
                  Create your first promotion to boost sales
                </p>
                <Button asChild>
                  <Link href="/dashboard/deals-coupons/promotions/create">
                    <PlusIcon className="mr-2 size-4" />
                    Create Promotion
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {promotions.map((promotion) => (
                  <PromotionCard key={promotion.id} promotion={promotion} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="coupons" className="space-y-4">
            <Tabs defaultValue={status || "all"}>
              <TabsList>
                <TabsTrigger value="all" asChild>
                  <Link href="/dashboard/deals-coupons?tab=coupons">All</Link>
                </TabsTrigger>
                <TabsTrigger value="active" asChild>
                  <Link href="/dashboard/deals-coupons?tab=coupons&status=active">
                    Active
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="scheduled" asChild>
                  <Link href="/dashboard/deals-coupons?tab=coupons&status=scheduled">
                    Scheduled
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="expired" asChild>
                  <Link href="/dashboard/deals-coupons?tab=coupons&status=expired">
                    Expired
                  </Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {!coupons || coupons.length === 0 ? (
              <div className="bg-card flex flex-col items-center justify-center rounded-lg border p-12 text-center">
                <h3 className="mb-2 text-lg font-semibold">No coupons yet</h3>
                <p className="text-muted-foreground mb-6 text-sm">
                  Create coupon codes for customers
                </p>
                <Button asChild>
                  <Link href="/dashboard/deals-coupons/coupons/create">
                    <PlusIcon className="mr-2 size-4" />
                    Create Coupon
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {coupons.map((coupon) => (
                  <CouponCard key={coupon.id} coupon={coupon} />
                ))}
              </div>
            )}
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  );
};

export default DealsCouponsPage;
