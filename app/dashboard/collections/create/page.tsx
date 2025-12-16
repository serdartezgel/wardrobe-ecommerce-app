import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";

import CollectionForm from "@/components/forms/CollectionForm";
import { Button } from "@/components/ui/button";

const CreateCollectionPage = () => {
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
        <CollectionForm />
      </div>
    </div>
  );
};

export default CreateCollectionPage;
