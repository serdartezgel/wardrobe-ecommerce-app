import Link from "next/link";

import BrandsTable from "@/components/tables/BrandsTable";
import { Button } from "@/components/ui/button";

const BrandsPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Brands</h1>
          <p className="text-muted-foreground mt-1">
            Manage your brands with clarity, control, and ease
          </p>
        </div>

        <Button asChild>
          <Link href={"/dashboard/brands/create"}>Create a New Brand</Link>
        </Button>
      </header>

      <BrandsTable />
    </div>
  );
};

export default BrandsPage;
