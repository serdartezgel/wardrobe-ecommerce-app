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
import { format } from "date-fns";
import { Loader2Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { OrderListItem } from "@/types/prisma";

import { getOrderColumns } from "./colums";
import DataTable from "./DataTable";
import TableSearch from "./TableSearch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const OrdersTable = ({ orders }: { orders: OrderListItem[] }) => {
  const [mounted, setMounted] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const columns = useMemo<ColumnDef<OrderListItem>[]>(
    () => getOrderColumns(),
    [],
  );

  const data = useMemo(() => orders, [orders]);

  const globalSearchFilter: FilterFn<OrderListItem> = (
    row,
    columnIds,
    filterValue,
  ) => {
    const search = filterValue.toLowerCase();

    return [
      row.original.orderNumber,
      row.original.user.name,
      format(new Date(row.original.createdAt), "MMM dd, yyyy. HH:mm"),
      row.original.status,
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

  const statusFilterValue =
    (table.getColumn("status")?.getFilterValue() as string) ?? "";

  if (!mounted) {
    return (
      <Loader2Icon className="flex size-6 w-full animate-spin items-center justify-center" />
    );
  }

  return (
    <>
      <section className="flex flex-wrap items-start gap-6">
        <div className="flex flex-col">
          <TableSearch table={table} />
          <span className="text-muted-foreground text-sm">
            Search by order number, customer name and date
          </span>
        </div>
        <Select
          value={statusFilterValue}
          onValueChange={(value) =>
            table
              .getColumn("status")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="no-focus my-4 w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section>
        <DataTable table={table} />
      </section>
    </>
  );
};

export default OrdersTable;
