import Link from "next/link";

import CollectionCard from "@/components/cards/CollectionCard";
import { Button } from "@/components/ui/button";
import { getAllCollections } from "@/lib/actions/collection.action";

const DashboardCollectionsPage = async () => {
  const result = await getAllCollections(true);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Collections</h1>
          <p className="text-muted-foreground mt-1">
            Organize your products into curated collections
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/collections/create">
            Create a New Collection
          </Link>
        </Button>
      </header>

      {result.data && result.data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {result.data.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              variant="dashboard"
            />
          ))}
        </div>
      ) : (
        <div className="bg-card flex flex-col items-center justify-center rounded-lg border p-12 text-center">
          <h3 className="mb-2 text-lg font-semibold">No collections yet</h3>
          <p className="text-muted-foreground mb-6 text-sm">
            Start organizing your products by creating collections
          </p>
          <Button asChild>
            <Link href="/dashboard/collections/create">
              Create Your First Collection
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default DashboardCollectionsPage;
