"use client";

import { Row, type Table as TanstackTable } from "@tanstack/react-table";
import { useEffect, useState } from "react";

import { ProductWithRelations } from "@/types/prisma";

import { Button } from "../ui/button";

interface DataTableProps<TData> {
  table: TanstackTable<TData>;
}

const ProductBulkActions = ({
  table,
}: DataTableProps<ProductWithRelations>) => {
  const [selected, setSelected] = useState<Row<ProductWithRelations>[]>([]);

  const tableRows = table.getSelectedRowModel().rows;

  useEffect(() => {
    const currentSelected = table.getSelectedRowModel().rows ?? [];
    setSelected(currentSelected);
  }, [table, tableRows]);

  const allActive = selected.every(
    (row) => row.getValue<boolean>("status") === true,
  );

  const allPublished = selected.every(
    (row) => row.original.status === "PUBLISHED",
  );

  const activateButtonLabel = allActive ? "Deactivate" : "Activate";

  return (
    <div className="bg-muted border-border w-fit rounded-lg border px-4 py-4 shadow-sm">
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={selected.length === 0 || allPublished}
          className="bg-cyan-500 hover:bg-cyan-500/80"
        >
          Publish
        </Button>
        <Button disabled={selected.length === 0}>{activateButtonLabel}</Button>
        <Button variant={"destructive"} disabled={selected.length === 0}>
          Delete
        </Button>
        <Button variant={"outline"} disabled={selected.length === 0}>
          Export
        </Button>
      </div>
      {selected.length > 0 && (
        <p className="text-muted-foreground border-border mt-4 border-t pt-3 text-sm">
          {selected.length} {selected.length === 1 ? "item" : "items"} selected
        </p>
      )}
    </div>
  );
};

export default ProductBulkActions;
