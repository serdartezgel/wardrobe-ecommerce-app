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
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";

import { BrandTable, BrandWithRelations } from "@/types/prisma";

import { getBrandColumns } from "./colums";
import DataTable from "./DataTable";
import TableSearch from "./TableSearch";
import DashboardBrandFilters from "../filters/DashboardBrandFilters";

const BrandsTable = ({
  brands,
}: {
  brands: (BrandWithRelations & BrandTable)[];
}) => {
  const [mounted, setMounted] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const columns: ColumnDef<BrandTable>[] = getBrandColumns();
  const data: BrandTable[] = brands;

  const globalSearchFilter: FilterFn<BrandTable> = (
    row,
    columnId,
    filterValue,
  ) => {
    const search = String(filterValue).toLowerCase();

    const cellValue = row.getValue("name") ?? "";
    return cellValue.toString().toLowerCase().includes(search);
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
      <Loader2Icon className="flex size-6 w-full animate-spin items-center justify-center" />
    );

  return (
    <>
      <section>
        <TableSearch table={table} />
      </section>
      <section className="flex flex-wrap items-center justify-between gap-4">
        <DashboardBrandFilters table={table} />
      </section>
      <section>
        <DataTable table={table} />
      </section>
    </>
  );
};

export default BrandsTable;
