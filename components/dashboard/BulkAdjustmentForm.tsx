"use client";

import { Upload, Download, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { bulkAdjustInventory } from "@/lib/actions/inventory.action";
import { InventoryLogType } from "@/lib/generated/prisma";

interface Adjustment {
  variantId: string;
  sku: string;
  change: number;
  note: string;
}

export function BulkAdjustmentForm() {
  const router = useRouter();
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [type, setType] = useState<InventoryLogType>("RESTOCK");
  const [isPending, startTransition] = useTransition();

  const addAdjustment = () => {
    setAdjustments([
      ...adjustments,
      { variantId: "", sku: "", change: 0, note: "" },
    ]);
  };

  const removeAdjustment = (index: number) => {
    setAdjustments(adjustments.filter((_, i) => i !== index));
  };

  const updateAdjustment = (
    index: number,
    field: keyof Adjustment,
    value: string | number,
  ) => {
    const updated = [...adjustments];
    updated[index] = { ...updated[index], [field]: value };
    setAdjustments(updated);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").slice(1); // Skip header

      const parsed: Adjustment[] = lines
        .filter((line) => line.trim())
        .map((line) => {
          const [sku, variantId, change, note] = line.split(",");
          return {
            sku: sku?.trim() || "",
            variantId: variantId?.trim() || "",
            change: parseInt(change?.trim() || "0"),
            note: note?.trim() || "",
          };
        });

      setAdjustments(parsed);
      toast.success(`Imported ${parsed.length} adjustments`);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csv =
      "SKU,Variant ID,Change,Note\nSKU-001,variant-id-here,10,Restocking from warehouse";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory-adjustment-template.csv";
    a.click();
  };

  const handleSubmit = () => {
    if (adjustments.length === 0) {
      toast.error("Please add at least one adjustment");
      return;
    }

    const invalidAdjustments = adjustments.filter(
      (a) => !a.variantId || a.change === 0,
    );
    if (invalidAdjustments.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    startTransition(async () => {
      const result = await bulkAdjustInventory({
        adjustments: adjustments.map((a) => ({
          variantId: a.variantId,
          change: a.change,
          note: a.note,
        })),
        type,
      });

      if (result.success) {
        toast.success(`Updated ${result.data?.updated} item(s) successfully`);
        setAdjustments([]);
        router.refresh();
      } else {
        toast.error("Failed to update inventory", {
          description: result.error?.message,
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Inventory Adjustment</CardTitle>
        <CardDescription>
          Adjust multiple items at once. You can manually enter data or import
          from CSV.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-4">
            <Label>Adjustment Type</Label>
            <Select
              value={type}
              onValueChange={(v: InventoryLogType) => setType(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RESTOCK">Restock</SelectItem>
                <SelectItem value="MANUAL_ADJUSTMENT">
                  Manual Adjustment
                </SelectItem>
                <SelectItem value="DAMAGED_LOST">Damaged/Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Template
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("csv-upload")?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCSVUpload}
            />
            <Button size="sm" onClick={addAdjustment}>
              <Plus className="mr-2 h-4 w-4" />
              Add Row
            </Button>
          </div>
        </div>

        {adjustments.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU (Optional)</TableHead>
                  <TableHead>Variant ID *</TableHead>
                  <TableHead>Change *</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustments.map((adj, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        value={adj.sku}
                        onChange={(e) =>
                          updateAdjustment(index, "sku", e.target.value)
                        }
                        placeholder="SKU-001"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={adj.variantId}
                        onChange={(e) =>
                          updateAdjustment(index, "variantId", e.target.value)
                        }
                        placeholder="variant-id"
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={adj.change}
                        onChange={(e) =>
                          updateAdjustment(
                            index,
                            "change",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        placeholder="0"
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={adj.note}
                        onChange={(e) =>
                          updateAdjustment(index, "note", e.target.value)
                        }
                        placeholder="Optional note"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAdjustment(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {adjustments.length > 0 && (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setAdjustments([])}
              disabled={isPending}
            >
              Clear All
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending
                ? "Processing..."
                : `Update ${adjustments.length} Item(s)`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
