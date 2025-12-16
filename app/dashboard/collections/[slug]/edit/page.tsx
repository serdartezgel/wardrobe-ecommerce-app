import { format } from "date-fns";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import CollectionForm from "@/components/forms/CollectionForm";
import { Button } from "@/components/ui/button";
import { getCollectionBySlug } from "@/lib/actions/collection.action";

const DashboardCollectionPage = async ({ params }: RouteParams) => {
  const { slug } = await params;
  const result = await getCollectionBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const collection = result.data;

  return (
    <div className="flex flex-col gap-4">
      <Button variant="link" size="sm" asChild className="w-fit gap-2">
        <Link href="/dashboard/collections">
          <ChevronLeftIcon className="size-4" />
          Back to Collections
        </Link>
      </Button>

      <header>
        <h1 className="text-3xl font-bold">Edit Collection</h1>
        <p className="text-muted-foreground mt-1">
          Update collection details and settings
        </p>
      </header>

      <div className="bg-card rounded-lg border p-6">
        <CollectionForm
          initialData={{
            id: collection.id,
            name: collection.name,
            slug: collection.slug,
            description: collection.description || "",
            image: collection.image || "",
            type: collection.type,
            isActive: collection.isActive,
            isFeatured: collection.isFeatured,
            order: collection.order,
            rules: collection.rules || "",
            metaTitle: collection.metaTitle || "",
            metaDescription: collection.metaDescription || "",
            publishedAt: collection.publishedAt
              ? format(new Date(collection.publishedAt), "yyyy-MM-dd'T'HH:mm")
              : "",
            validFrom: collection.validFrom
              ? format(new Date(collection.validFrom), "yyyy-MM-dd")
              : "",
            validUntil: collection.validUntil
              ? format(new Date(collection.validUntil), "yyyy-MM-dd")
              : "",
          }}
          isEditing
        />
      </div>
    </div>
  );
};

export default DashboardCollectionPage;
