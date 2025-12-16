import { format } from "date-fns";
import { ChevronLeftIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import CollectionProductsManager from "@/components/dashboard/CollectionProductsManager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCollectionBySlug } from "@/lib/actions/collection.action";

const typeLabels: Record<string, string> = {
  MANUAL: "Manual",
  AUTOMATIC: "Automatic",
  SEASONAL: "Seasonal",
  DEAL: "Deal",
  NEW_ARRIVAL: "New Arrival",
  BESTSELLER: "Bestseller",
};

const CollectionDetailPage = async ({ params }: RouteParams) => {
  const { slug } = await params;

  const result = await getCollectionBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const collection = result.data;

  const getStatus = () => {
    const now = new Date();
    const publishedAt = collection.publishedAt
      ? new Date(collection.publishedAt)
      : null;
    const validFrom = collection.validFrom
      ? new Date(collection.validFrom)
      : null;
    const validUntil = collection.validUntil
      ? new Date(collection.validUntil)
      : null;

    if (!collection.isActive) {
      return { label: "Inactive", variant: "secondary" as const };
    }

    if (publishedAt && publishedAt > now) {
      return { label: "Scheduled", variant: "default" as const };
    }

    if (validUntil && validUntil < now) {
      return { label: "Expired", variant: "destructive" as const };
    }

    if (validFrom && validFrom > now) {
      return { label: "Scheduled", variant: "default" as const };
    }

    return { label: "Active", variant: "default" as const };
  };

  const status = getStatus();

  return (
    <div className="flex flex-col gap-6">
      <Button variant="link" size="sm" asChild className="w-fit gap-2">
        <Link href="/dashboard/collections">
          <ChevronLeftIcon className="size-4" />
          Back to Collections
        </Link>
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{collection.name}</h1>
            <Badge variant={status.variant}>{status.label}</Badge>
            {collection.isFeatured && <Badge>Featured</Badge>}
            <Badge variant="outline">{typeLabels[collection.type]}</Badge>
          </div>
          <p className="text-muted-foreground mt-2">/{collection.slug}</p>
          {collection.description && (
            <p className="text-muted-foreground mt-2">
              {collection.description}
            </p>
          )}
        </div>

        <Button asChild>
          <Link href={`/dashboard/collections/${collection.slug}/edit`}>
            <PencilIcon className="mr-2 size-4" />
            Edit Collection
          </Link>
        </Button>
      </div>

      <div className="bg-card grid gap-4 rounded-lg border p-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-muted-foreground text-sm">Type</p>
          <p className="mt-1 font-medium">{typeLabels[collection.type]}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Display Order</p>
          <p className="mt-1 font-medium">{collection.order}</p>
        </div>
        {collection.validFrom && (
          <div>
            <p className="text-muted-foreground text-sm">Valid From</p>
            <p className="mt-1 font-medium">
              {format(new Date(collection.validFrom), "MMM dd, yyyy")}
            </p>
          </div>
        )}
        {collection.validUntil && (
          <div>
            <p className="text-muted-foreground text-sm">Valid Until</p>
            <p className="mt-1 font-medium">
              {format(new Date(collection.validUntil), "MMM dd, yyyy")}
            </p>
          </div>
        )}
      </div>

      {collection.type === "MANUAL" ? (
        <CollectionProductsManager collectionId={collection.id} />
      ) : (
        <div className="bg-card rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Automatic Collection</h2>
          <p className="text-muted-foreground text-sm">
            This collection automatically includes products based on rules.
          </p>
          {collection.rules && (
            <div className="mt-4">
              <p className="text-sm font-medium">Current Rules:</p>
              <pre className="bg-muted mt-2 overflow-auto rounded-md p-3 text-xs">
                {JSON.stringify(JSON.parse(collection.rules), null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CollectionDetailPage;
