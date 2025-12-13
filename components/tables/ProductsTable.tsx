"use client";

import {
  ColumnDef,
  FilterFn,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ProductWithRelations } from "@/types/prisma";

import { getProductColumns } from "./colums";
import DataTable from "./DataTable";
import TableSearch from "./TableSearch";
import ProductBulkActions from "../dashboard/ProductBulkActions";
import DashboardProductFilters from "../filters/DashboardProductFilters";

interface ProductsTableProps {
  products: ProductWithRelations[];
}

const ProductsTable = ({ products }: ProductsTableProps) => {
  const [mounted, setMounted] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<unknown>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const columns: ColumnDef<ProductWithRelations>[] = getProductColumns();
  const data = useMemo<ProductWithRelations[]>(() => {
    return products.map((p) => ({
      ...p,
      sku: p.variants[0]?.sku || "N/A",
    }));
  }, [products]);

  const globalSearchFilter: FilterFn<ProductWithRelations> = (
    row,
    columnIds,
    filterValue,
  ) => {
    const search = String(filterValue).toLowerCase();

    const columnsToSearch = ["name", "brand", "category", "sku"];

    return columnsToSearch.some((colId) => {
      const cellValue = row.getValue(colId);
      return String(cellValue).toLowerCase().includes(search);
    });
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalSearchFilter,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
    state: { sorting, globalFilter, rowSelection },
  });

  if (!mounted)
    return (
      <Loader2 className="flex size-6 w-full animate-spin items-center justify-center" />
    );

  return (
    <>
      <section>
        <TableSearch table={table} />
      </section>
      <section className="flex flex-wrap items-center justify-between gap-4">
        <DashboardProductFilters table={table} />
        <ProductBulkActions table={table} />
      </section>
      <section>
        <DataTable table={table} />
      </section>
    </>
  );
};
export default ProductsTable;
