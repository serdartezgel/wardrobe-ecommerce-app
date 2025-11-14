import Link from "next/link";

import CategoryTree from "@/components/dashboard/CategoryTree";
import { Button } from "@/components/ui/button";
import { getAllCategories } from "@/lib/actions/category.action";

const CategoriesPage = async () => {
  const result = await getAllCategories(true);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Create, organize, and manage categories and subcategories with ease
          </p>
        </div>

        <Button asChild>
          <Link href={"/dashboard/categories/create"}>
            Create a New Category
          </Link>
        </Button>
      </header>

      <div className="bg-muted border-border rounded-lg border p-4">
        <CategoryTree categories={result.data || []} />
      </div>
    </div>
  );
};

export default CategoriesPage;
