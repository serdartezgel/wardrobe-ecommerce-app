"use client";

import { ColumnDef, CoreRow } from "@tanstack/react-table";
import { ArrowUpDownIcon, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { ReadonlyURLSearchParams } from "next/navigation";

import { Product } from "@/lib/generated/prisma";
import { formUrlQuery } from "@/lib/utils/url";

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

export const getProductColumns = (
  searchParams: ReadonlyURLSearchParams,
  pathname: string,
): ColumnDef<Product>[] => [
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
    accessorFn: (row) => row.name,
    id: "name",
    header: () => {
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "sort",
        value: searchParams.get("sort") === "asc" ? "desc" : "asc",
        pathname,
      });
      return (
        <Button
          asChild
          variant={"link"}
          className="w-full justify-between !pl-0"
        >
          <Link href={newUrl}>
            Product Name <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      );
    },
    cell: ({ row }) => (
      <Link href={`/dashboard/products/${row.original.slug}`}>
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorFn: (row) => row.brand.name,
    id: "brand",
    header: () => {
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "sort",
        value: searchParams.get("sort") === "asc" ? "desc" : "asc",
        pathname,
      });
      return (
        <Button
          asChild
          variant={"link"}
          className="w-full justify-between !pl-0"
        >
          <Link href={newUrl}>
            Brand <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      );
    },
    cell: ({ row }) => (
      <Link href={`/dashboard/products/${row.original.brand.name}`}>
        {row.original.brand.name}
      </Link>
    ),
  },
  {
    accessorFn: (row) => row.category.name,
    id: "category",
    header: () => {
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "sort",
        value: searchParams.get("sort") === "asc" ? "desc" : "asc",
        pathname,
      });
      return (
        <Button
          asChild
          variant={"link"}
          className="w-full justify-between !pl-0"
        >
          <Link href={newUrl}>
            Category <ArrowUpDownIcon className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      );
    },
    cell: ({ row }) => (
      <Link href={`/dashboard/products/${row.original.category.name}`}>
        {row.original.category.name}
      </Link>
    ),
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "basePrice",
    header: "Base Price",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (row.original.isActive ? "Active" : "Inactive"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: CoreRow<Product> }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="sr-only">Actions</DropdownMenuLabel>
          <DropdownMenuItem>
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
          <DropdownMenuItem asChild>
            <Link href={""}>Delete</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
