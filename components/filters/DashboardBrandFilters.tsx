"use client";

import { Table } from "@tanstack/react-table";
import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const DashboardBrandFilters = <TData,>({ table }: { table: Table<TData> }) => {
  const [status, setStatus] = useState("");

  const tableRows = table.getCoreRowModel().rows;
  const statusFilterValue = table.getColumn("status")?.getFilterValue();

  useEffect(() => {
    const currentStatus =
      (table.getColumn("status")?.getFilterValue() as string) ?? "";

    setStatus(currentStatus);
  }, [tableRows, statusFilterValue, table]);

  const activeFiltersCount = [status !== ""].filter(Boolean).length;

  const handleClearFilters = () => {
    table.resetColumnFilters();
  };

  return (
    <div className="bg-muted border-border max-w-2xl rounded-lg border p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status */}
          <Select
            value={status}
            onValueChange={(value) =>
              table
                .getColumn("status")
                ?.setFilterValue(value === "all" ? "" : value)
            }
            disabled={tableRows.length === 0}
          >
            <SelectTrigger className="no-focus">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {activeFiltersCount > 0 && (
            <Button
              variant={"secondary"}
              onClick={handleClearFilters}
              className="border-1"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
export default DashboardBrandFilters;
