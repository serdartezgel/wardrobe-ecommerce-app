import Link from "next/link";

import { Button } from "@/components/ui/button";

const CategoriesPage = () => {
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
    </div>
  );
};

export default CategoriesPage;
