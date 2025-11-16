"use client";

import { type Table as TanstackTable } from "@tanstack/react-table";
import { SearchIcon } from "lucide-react";
import { useRef } from "react";

import { Input } from "../ui/input";

interface DataTableProps<TData> {
  table: TanstackTable<TData>;
}

const TableSearch = <TData,>({ table }: DataTableProps<TData>) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative flex max-w-sm items-center py-4">
      <Input
        ref={inputRef}
        placeholder="Search"
        value={table.getState().globalFilter ?? ""}
        onChange={(e) => table.setGlobalFilter(String(e.target.value))}
        className="no-focus max-w-sm pr-10"
        disabled={table.getCoreRowModel().rows.length === 0}
      />
      <SearchIcon
        onClick={() => inputRef.current?.focus()}
        className="text-muted-foreground absolute right-3 size-5 cursor-pointer"
      />
    </div>
  );
};

export default TableSearch;
