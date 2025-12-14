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

import { InventoryLogWithRelations } from "@/types/prisma";

import { getInventoryLogColumns } from "./colums";
import DataTable from "../tables/DataTable";
import TableSearch from "../tables/TableSearch";

interface InventoryLogsTableProps {
  logs: InventoryLogWithRelations[];
}

const InventoryLogsTable = ({ logs }: InventoryLogsTableProps) => {
  const [mounted, setMounted] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const columns = useMemo<ColumnDef<InventoryLogWithRelations>[]>(
    () => getInventoryLogColumns(),
    [],
  );

  const data = useMemo(() => logs, [logs]);

  const globalSearchFilter: FilterFn<InventoryLogWithRelations> = (
    row,
    columnIds,
    filterValue,
  ) => {
    const search = filterValue.toLowerCase();

    return [
      row.original.variant.product.name,
      row.original.variant.sku,
      row.original.note,
      row.original.type,
    ]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(search));
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

  if (!mounted) {
    return (
      <Loader2 className="flex size-6 w-full animate-spin items-center justify-center" />
    );
  }

  return (
    <>
      <section>
        <TableSearch table={table} />
      </section>

      <section>
        <DataTable table={table} />
      </section>
    </>
  );
};

export default InventoryLogsTable;
