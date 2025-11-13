import Link from "next/link";

import ProductsTable from "@/components/tables/ProductsTable";
import { Button } from "@/components/ui/button";

const ProductsPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog and variants with ease
          </p>
        </div>

        <Button asChild>
          <Link href={"/dashboard/products/create"}>Create a New Product</Link>
        </Button>
      </header>

      <ProductsTable />
    </div>
  );
};

export default ProductsPage;
