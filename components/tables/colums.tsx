"use client";

import { ColumnDef, CoreRow } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDownIcon, EyeIcon, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { deleteBrand } from "@/lib/actions/brand.action";
import { formatPrice } from "@/lib/utils/price";
import {
  BrandTable,
  InventoryLogWithRelations,
  OrderListItem,
  ProductWithRelations,
} from "@/types/prisma";

import { OrderStatusBadge } from "../dashboard/OrderDetailView";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
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
        {row.original.status === "PUBLISHED"
          ? row.original.name
          : row.original.status === "DRAFT"
            ? row.original.name + " - Draft"
            : row.original.name + " - Archived"}
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
    accessorFn: (row) => row.variants.map((v) => v.sku),
    header: "SKU",
    filterFn: "includesString",
  },
  {
    accessorKey: "variants",
    accessorFn: (row) =>
      row.productOptions.map(
        (options) =>
          `${options.name}: ${options.values.map((v) => v).join(", ")}`,
      ),
    header: "Variants",
  },
  {
    accessorKey: "basePriceCents",
    header: "Base Price",
    cell: ({ row }) => formatPrice(row.original.basePriceCents),
    filterFn: "inNumberRange",
  },
  {
    accessorFn: (row) => row.isActive,
    id: "status",
    header: "Status",
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge variant="default" className="px-2 py-1">
          Active
        </Badge>
      ) : (
        <Badge variant="secondary" className="px-2 py-1">
          Inactive
        </Badge>
      ),
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
          <Button variant="link" className="h-8 w-8 cursor-pointer p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="sr-only">Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Button
              variant={"ghost"}
              className="w-full justify-start pl-2"
              asChild
            >
              <Link href={`/dashboard/products/${row.original.slug}`}>
                View Details
              </Link>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Button
              variant={"ghost"}
              className="w-full justify-start pl-2"
              asChild
            >
              <Link href={`/dashboard/products/${row.original.slug}/edit`}>
                Edit
              </Link>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant={"ghost"}
                  className="text-destructive hover:text-destructive w-full justify-start pl-2"
                >
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. Are you sure you want to
                    permanently delete this product?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant={"secondary"}>Cancel</Button>
                  </DialogClose>
                  <Button variant={"destructive"} onClick={() => {}}>
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export const getBrandColumns = (): ColumnDef<BrandTable>[] => [
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
    accessorKey: "logo",
    header: "Logo",
    cell: ({ row }) => {
      const logo = row.original.logo;
      return logo ? (
        <Image src={logo} alt={row.original.name} width={60} height={60} />
      ) : (
        <div className="bg-muted size-15 rounded-lg" />
      );
    },
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
        href={`/dashboard/brands/${row.original.slug}`}
        className="hover:underline hover:underline-offset-4"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorFn: (row) => row.isActive,
    id: "status",
    header: ({ column }) => (
      <Button
        variant={"link"}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full cursor-pointer justify-between !pl-0"
      >
        Status <ArrowUpDownIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge variant="default">Active</Badge>
      ) : (
        <Badge variant="secondary">Inactive</Badge>
      ),
    filterFn: (row, columnId, filterValue) => {
      const rowValue = row.getValue<boolean>(columnId);
      if (filterValue === "active") return rowValue === true;
      if (filterValue === "inactive") return rowValue === false;
      return true;
    },
  },
  {
    accessorFn: (row) => row._count.products,
    id: "productCount",
    header: ({ column }) => (
      <Button
        variant={"link"}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full cursor-pointer justify-between !pl-0"
      >
        Products <ArrowUpDownIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.original._count.products,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: CoreRow<BrandTable> }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="link" className="h-8 w-8 cursor-pointer p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="sr-only">Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Button
              variant={"ghost"}
              className="w-full justify-start pl-2"
              asChild
            >
              <Link href={`/dashboard/brands/${row.original.slug}`}>
                View Details
              </Link>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Button
              variant={"ghost"}
              className="w-full justify-start pl-2"
              asChild
            >
              <Link href={`/dashboard/brands/${row.original.slug}/edit`}>
                Edit
              </Link>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()}
            className="p-0"
          >
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant={"ghost"}
                  className="text-destructive hover:text-destructive w-full justify-start pl-2"
                >
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. Are you sure you want to
                    permanently delete this brand?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant={"secondary"}>Cancel</Button>
                  </DialogClose>
                  <Button
                    variant={"destructive"}
                    onClick={async () => {
                      const result = await deleteBrand(row.original.id);

                      if (result.success) {
                        toast.success("Success", {
                          description: "Brand deleted successfully.",
                        });
                      } else {
                        toast.error(`Error ${result.status}`, {
                          description:
                            result.error?.message || "Something went wrong.",
                        });
                      }
                    }}
                  >
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

const logTypeColors = {
  ORDER_PLACED: "destructive",
  ORDER_CANCELLED: "default",
  MANUAL_ADJUSTMENT: "secondary",
  RESTOCK: "default",
  DAMAGED_LOST: "destructive",
} as const;

export const getInventoryLogColumns =
  (): ColumnDef<InventoryLogWithRelations>[] => [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ getValue }) =>
        new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(getValue<Date>())),
    },
    {
      id: "product",
      header: "Product",
      accessorFn: (row) => row.variant.product.name,
    },
    {
      id: "variant",
      header: "Variant",
      accessorFn: (row) =>
        row.variant.variantOptions.map((vo) => vo.value).join(" / "),
    },
    {
      id: "variantId",
      header: "Variant ID",
      accessorFn: (row) => row.variant.id,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ getValue }) => {
        const type = getValue<keyof typeof logTypeColors>();
        return (
          <Badge variant={logTypeColors[type]}>{type.replace(/_/g, " ")}</Badge>
        );
      },
    },
    {
      accessorKey: "change",
      header: "Change",
      cell: ({ getValue }) => {
        const value = getValue<number>();
        return (
          <span className={value > 0 ? "text-green-600" : "text-red-600"}>
            {value > 0 ? "+" : ""}
            {value}
          </span>
        );
      },
    },
    {
      accessorKey: "resultingStock",
      header: "Resulting Stock",
    },
    {
      id: "admin",
      header: "Admin",
      accessorFn: (row) => row.admin?.name || "System",
    },
    {
      accessorKey: "note",
      header: "Note",
      cell: ({ getValue }) => getValue<string>() || "-",
    },
  ];

export const getOrderColumns = (): ColumnDef<OrderListItem>[] => [
  {
    accessorKey: "orderNumber",
    header: "Order Number",
  },
  {
    accessorKey: "customer",
    accessorFn: (row) => row.user.name,
    header: "Customer",
  },
  {
    accessorKey: "createdAt",
    accessorFn: (row) => format(new Date(row.createdAt), "MMM dd, yyyy. HH:mm"),
    header: "Date",
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) =>
      `${row.original.items.reduce((sum, item) => sum + item.quantity, 0)} items`,
  },
  {
    accessorKey: "totalCents",
    accessorFn: (row) => formatPrice(row.totalCents),
    header: "Total",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: CoreRow<OrderListItem> }) => (
      <Button variant="link" className="px-0!" asChild>
        <Link href={`/dashboard/orders/${row.original.id}`}>
          <EyeIcon className="size-4" />
          View
        </Link>
      </Button>
    ),
  },
];
