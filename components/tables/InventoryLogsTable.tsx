"use client";

import {
  ColumnDef,
  FilterFn,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { InventoryLogWithRelations } from "@/types/prisma";

import { getInventoryLogColumns } from "./colums";
import DataTable from "../tables/DataTable";
import TableSearch from "../tables/TableSearch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface InventoryLogsTableProps {
  logs: InventoryLogWithRelations[];
}

const InventoryLogsTable = ({ logs }: InventoryLogsTableProps) => {
  const [mounted, setMounted] = useState(false);
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
      row.original.variant.variantOptions.map((vo) => vo.value).join(" / "),
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
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalSearchFilter,
    getRowId: (row) => row.id,
    state: { globalFilter },
  });

  const typeFilterValue =
    (table.getColumn("type")?.getFilterValue() as string) ?? "";

  if (!mounted) {
    return (
      <Loader2 className="flex size-6 w-full animate-spin items-center justify-center" />
    );
  }

  return (
    <>
      <section className="flex flex-wrap items-center gap-6">
        <TableSearch table={table} />
        <Select
          value={typeFilterValue}
          onValueChange={(value) =>
            table
              .getColumn("type")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="no-focus w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="ORDER_PLACED">Order Placed</SelectItem>
            <SelectItem value="ORDER_CANCELLED">Order Cancelled</SelectItem>
            <SelectItem value="MANUAL_ADJUSTMENT">Manual Adjustment</SelectItem>
            <SelectItem value="RESTOCK">Restock</SelectItem>
            <SelectItem value="DAMAGED_LOST">Damaged/Lost</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section>
        <DataTable table={table} />
      </section>
    </>
  );
};

export default InventoryLogsTable;
