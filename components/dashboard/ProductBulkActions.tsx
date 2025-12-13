"use client";

import { Row, type Table as TanstackTable } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  bulkDeleteProducts,
  bulkUpdateProductActiveStatus,
  bulkUpdateProductStatus,
} from "@/lib/actions/product.action";
import { ProductWithRelations } from "@/types/prisma";

import { Button } from "../ui/button";

interface DataTableProps<TData> {
  table: TanstackTable<TData>;
}

const ProductBulkActions = ({
  table,
}: DataTableProps<ProductWithRelations>) => {
  const router = useRouter();
  const [selected, setSelected] = useState<Row<ProductWithRelations>[]>([]);
  const [isPending, startTransition] = useTransition();

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
  const selectedIds = selected.map((row) => row.original.id);

  const handleActivation = async (isActive: boolean) => {
    startTransition(async () => {
      const result = await bulkUpdateProductActiveStatus(selectedIds, isActive);

      if (result.success) {
        toast.success("Success", {
          description: isActive
            ? "Products activated successfully."
            : "Products deactivated successfully.",
        });

        router.refresh();
      } else {
        toast.error(`Error ${result.status}`, {
          description: result.error?.message || "Something went wrong.",
        });
      }
    });
  };

  const handlePublish = () => {
    startTransition(async () => {
      const result = await bulkUpdateProductStatus(selectedIds, "PUBLISHED");

      if (result.success) {
        toast.success("Success", {
          description: "Products published successfully.",
        });
        router.refresh();
      } else {
        toast.error(`Error ${result.status}`, {
          description: result.error?.message || "Something went wrong.",
        });
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await bulkDeleteProducts(selectedIds);

      if (result.success) {
        toast.success("Success", {
          description: "Products deleted successfully.",
        });
        router.refresh();
      } else {
        toast.error(`Error ${result.status}`, {
          description: result.error?.message || "Something went wrong.",
        });
      }
    });
  };

  return (
    <div className="bg-muted border-border w-fit rounded-lg border px-4 py-4 shadow-sm">
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={selected.length === 0 || allPublished || isPending}
          className="bg-cyan-500 hover:bg-cyan-500/80"
          onClick={handlePublish}
        >
          Publish
        </Button>
        <Button
          disabled={selected.length === 0 || isPending}
          onClick={() => handleActivation(!allActive)}
        >
          {activateButtonLabel}
        </Button>
        <Button
          variant={"destructive"}
          disabled={selected.length === 0 || isPending}
          onClick={handleDelete}
        >
          Delete
        </Button>
        <Button
          variant={"outline"}
          disabled={selected.length === 0 || isPending}
        >
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
