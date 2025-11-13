"use client";

import { ColumnDef, CoreRow } from "@tanstack/react-table";
import { ArrowUpDownIcon, MoreHorizontal } from "lucide-react";
import Link from "next/link";

import { ProductWithRelations } from "@/types/prisma";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const getProductColumns = (): ColumnDef<ProductWithRelations>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant={"link"}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full cursor-pointer justify-between !pl-0"
      >
        Name <ArrowUpDownIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link
        href={`/dashboard/products/${row.original.slug}`}
        className="hover:underline hover:underline-offset-4"
      >
        {row.original.name}
      </Link>
    ),
    filterFn: "includesString",
  },
  {
    accessorFn: (row) => row.brand.name,
    id: "brand",
    header: ({ column }) => (
      <Button
        variant={"link"}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full cursor-pointer justify-between !pl-0"
      >
        Brand <ArrowUpDownIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link
        href={`/dashboard/products/${row.original.brand.name}`}
        className="hover:underline hover:underline-offset-4"
      >
        {row.original.brand.name}
      </Link>
    ),
    filterFn: "includesString",
  },
  {
    accessorFn: (row) => row.category.name,
    id: "category",
    header: ({ column }) => (
      <Button
        variant={"link"}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full cursor-pointer justify-between !pl-0"
      >
        Category <ArrowUpDownIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link
        href={`/dashboard/products/${row.original.category.name}`}
        className="hover:underline hover:underline-offset-4"
      >
        {row.original.category.name}
      </Link>
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "sku",
    header: "SKU",
    filterFn: "includesString",
  },
  {
    accessorKey: "basePrice",
    header: "Base Price",
    filterFn: "inNumberRange",
  },
  {
    accessorFn: (row) => row.isActive,
    id: "status",
    header: "Status",
    cell: ({ row }) => (row.original.isActive ? "Active" : "Inactive"),
    filterFn: (row, columnId, filterValue) => {
      const rowValue = row.getValue<boolean>(columnId);
      if (filterValue === "active") return rowValue === true;
      if (filterValue === "inactive") return rowValue === false;
      return true;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: CoreRow<ProductWithRelations> }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="link" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="sr-only">Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/products/${row.original.slug}`}>
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/products/edit/${row.original.slug}`}>
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
