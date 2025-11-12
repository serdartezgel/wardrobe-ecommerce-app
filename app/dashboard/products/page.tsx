import Link from "next/link";

import LocalSearch from "@/components/common/LocalSearch";
import Pagination from "@/components/common/Pagination";
import ProductBulkActions from "@/components/dashboard/ProductBulkActions";
import DashboardProductFilters from "@/components/filters/DashboardProductFilters";
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

      <section>
        <LocalSearch route="/dashboard/products" />
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4">
        <DashboardProductFilters />
        <ProductBulkActions />
      </section>

      <section></section>

      <section>
        <ProductsTable />
      </section>

      <section>
        <Pagination isNext={false} totalItems={0} />
      </section>
    </div>
  );
};

export default ProductsPage;
