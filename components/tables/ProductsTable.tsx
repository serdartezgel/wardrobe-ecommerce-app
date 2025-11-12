"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { getProductColumns } from "./colums";
import DataTable from "./DataTable";

const ProductsTable = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const columns = getProductColumns(searchParams, pathname);

  return (
    <>
      <DataTable columns={columns} data={[]} />
    </>
  );
};
export default ProductsTable;
