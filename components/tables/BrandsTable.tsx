"use client";

import {
  ColumnDef,
  FilterFn,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";

import { BrandTable } from "@/types/prisma";

import { getBrandColumns } from "./colums";
import DataTable from "./DataTable";
import TableSearch from "./TableSearch";
import DashboardBrandFilters from "../filters/DashboardBrandFilters";

export const brands = [
  {
    id: "brd_cloth_001",
    name: "UrbanThread",
    slug: "urban-thread",
    description:
      "Streetwear essentials crafted for bold and expressive personalities.",
    logo: "",
    isActive: true,
    createdAt: new Date("2024-04-10T10:00:00Z"),
    updatedAt: new Date("2025-01-10T12:00:00Z"),
    _count: {
      products: 42,
    },
    products: [],
  },
  {
    id: "brd_cloth_002",
    name: "VelvetLane",
    slug: "velvet-lane",
    description:
      "Luxury-inspired contemporary fashion with a soft, minimal aesthetic.",
    logo: "",
    isActive: true,
    createdAt: new Date("2024-02-18T09:40:00Z"),
    updatedAt: new Date("2025-01-08T15:20:00Z"),
    _count: {
      products: 18,
    },
    products: [],
  },
  {
    id: "brd_cloth_003",
    name: "NordicFit",
    slug: "nordic-fit",
    description:
      "Performance-driven activewear designed for athletes and explorers.",
    logo: "",
    isActive: true,
    createdAt: new Date("2023-11-10T08:15:00Z"),
    updatedAt: new Date("2024-12-22T14:10:00Z"),
    _count: {
      products: 27,
    },
    products: [],
  },
  {
    id: "brd_cloth_004",
    name: "CozyCove",
    slug: "cozy-cove",
    description:
      "Comfort-first clothing for slow living enthusiasts and minimalists.",
    logo: "",
    isActive: false,
    createdAt: new Date("2024-03-03T13:00:00Z"),
    updatedAt: new Date("2025-01-01T17:00:00Z"),
    _count: {
      products: 12,
    },
    products: [],
  },
  {
    id: "brd_cloth_005",
    name: "RetroWave Apparel",
    slug: "retrowave-apparel",
    description:
      "90s-inspired retro clothing with neon palettes and bold graphics.",
    logo: "",
    isActive: true,
    createdAt: new Date("2024-01-22T11:22:00Z"),
    updatedAt: new Date("2024-12-27T13:40:00Z"),
    _count: {
      products: 31,
    },
    products: [],
  },
  {
    id: "brd_cloth_006",
    name: "Orchard Denim",
    slug: "orchard-denim",
    description:
      "High-quality handcrafted denim jackets, jeans, and workwear staples.",
    logo: "",
    isActive: true,
    createdAt: new Date("2024-05-12T10:10:00Z"),
    updatedAt: new Date("2025-01-14T15:50:00Z"),
    _count: {
      products: 22,
    },
    products: [],
  },
  {
    id: "brd_cloth_007",
    name: "Feather & Thread",
    slug: "feather-thread",
    description:
      "Light, flowing, bohemian-style clothing designed for calm lifestyles.",
    logo: "",
    isActive: true,
    createdAt: new Date("2023-10-20T09:00:00Z"),
    updatedAt: new Date("2025-01-09T12:40:00Z"),
    _count: {
      products: 16,
    },
    products: [],
  },
];

const BrandsTable = () => {
  const [mounted, setMounted] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const columns: ColumnDef<BrandTable>[] = getBrandColumns();
  const data: BrandTable[] = brands;

  const globalSearchFilter: FilterFn<BrandTable> = (
    row,
    columnId,
    filterValue,
  ) => {
    const search = String(filterValue).toLowerCase();

    const cellValue = row.getValue("name") ?? "";
    return cellValue.toString().toLowerCase().includes(search);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalSearchFilter,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
    state: { sorting, globalFilter, rowSelection },
  });

  if (!mounted)
    return (
      <Loader2Icon className="flex size-6 w-full animate-spin items-center justify-center" />
    );

  return (
    <>
      <section>
        <TableSearch table={table} />
      </section>
      <section className="flex flex-wrap items-center justify-between gap-4">
        <DashboardBrandFilters table={table} />
      </section>
      <section>
        <DataTable table={table} />
      </section>
    </>
  );
};

export default BrandsTable;
