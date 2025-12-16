import { format } from "date-fns";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";

import CollectionForm from "@/components/forms/CollectionForm";
import { Button } from "@/components/ui/button";
import { getCollectionById } from "@/lib/actions/collection.action";

const CreateCollectionPage = async ({ searchParams }: RouteParams) => {
  const { duplicateId } = await searchParams;

  let initialData;
  if (duplicateId) {
    const result = await getCollectionById(duplicateId);
    if (result.success && result.data) {
      const collection = result.data;
      initialData = {
        name: `${collection.name} (Copy)`,
        slug: `${collection.slug}-copy`,
        description: collection.description || "",
        image: collection.image || "",
        type: collection.type,
        isActive: false,
        isFeatured: false,
        order: collection.order,
        rules: collection.rules || "",
        metaTitle: collection.metaTitle || "",
        metaDescription: collection.metaDescription || "",
        publishedAt: "",
        validFrom: collection.validFrom
          ? format(new Date(collection.validFrom), "yyyy-MM-dd")
          : "",
        validUntil: collection.validUntil
          ? format(new Date(collection.validUntil), "yyyy-MM-dd")
          : "",
      };
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Button variant="link" size="sm" asChild className="w-fit gap-2">
        <Link href="/dashboard/collections">
          <ChevronLeftIcon className="size-4" />
          Back to Collections
        </Link>
      </Button>

      <header>
        <h1 className="text-3xl font-bold">Create Collection</h1>
        <p className="text-muted-foreground mt-1">
          Create a new collection to organize your products
        </p>
      </header>

      <div className="bg-card rounded-lg border p-6">
        <CollectionForm initialData={initialData} isEditing={!!initialData} />
      </div>
    </div>
  );
};

export default CreateCollectionPage;
