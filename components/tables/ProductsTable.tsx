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
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { ProductWithRelations } from "@/types/prisma";

import { getProductColumns } from "./colums";
import DataTable from "./DataTable";
import TableSearch from "./TableSearch";
import ProductBulkActions from "../dashboard/ProductBulkActions";
import DashboardProductFilters from "../filters/DashboardProductFilters";

const products = [
  {
    id: "1",
    name: "Classic White T-Shirt",
    slug: "classic-white-t-shirt",
    brand: { id: "b1", name: "Nike" },
    category: { id: "c1", name: "T-Shirts" },
    sku: "TSH001",
    basePrice: 25.99,
    isActive: true,
  },
  {
    id: "2",
    name: "Slim Fit Blue Jeans",
    slug: "slim-fit-blue-jeans",
    brand: { id: "b2", name: "Levi’s" },
    category: { id: "c2", name: "Jeans" },
    sku: "JNS002",
    basePrice: 59.99,
    isActive: true,
  },
  {
    id: "3",
    name: "Black Hoodie",
    slug: "black-hoodie",
    brand: { id: "b3", name: "Adidas" },
    category: { id: "c3", name: "Hoodies" },
    sku: "HD003",
    basePrice: 49.99,
    isActive: false,
  },
  {
    id: "4",
    name: "Lightweight Running Shorts",
    slug: "lightweight-running-shorts",
    brand: { id: "b4", name: "Puma" },
    category: { id: "c4", name: "Shorts" },
    sku: "SH004",
    basePrice: 29.99,
    isActive: true,
  },
  {
    id: "5",
    name: "Denim Jacket",
    slug: "denim-jacket",
    brand: { id: "b5", name: "Wrangler" },
    category: { id: "c5", name: "Jackets" },
    sku: "JCK005",
    basePrice: 79.99,
    isActive: true,
  },
  {
    id: "6",
    name: "Leather Belt",
    slug: "leather-belt",
    brand: { id: "b6", name: "Gucci" },
    category: { id: "c6", name: "Accessories" },
    sku: "ACC006",
    basePrice: 120.0,
    isActive: false,
  },
  {
    id: "7",
    name: "Sporty Tracksuit",
    slug: "sporty-tracksuit",
    brand: { id: "b3", name: "Adidas" },
    category: { id: "c7", name: "Tracksuits" },
    sku: "TRK007",
    basePrice: 89.99,
    isActive: true,
  },
  {
    id: "8",
    name: "Wool Beanie",
    slug: "wool-beanie",
    brand: { id: "b2", name: "Levi’s" },
    category: { id: "c6", name: "Accessories" },
    sku: "ACC008",
    basePrice: 19.99,
    isActive: true,
  },
  {
    id: "9",
    name: "Oversized Graphic Tee",
    slug: "oversized-graphic-tee",
    brand: { id: "b1", name: "Nike" },
    category: { id: "c1", name: "T-Shirts" },
    sku: "TSH009",
    basePrice: 32.5,
    isActive: false,
  },
  {
    id: "10",
    name: "High-Top Sneakers",
    slug: "high-top-sneakers",
    brand: { id: "b7", name: "Converse" },
    category: { id: "c8", name: "Shoes" },
    sku: "SHOE010",
    basePrice: 74.99,
    isActive: true,
  },
  {
    id: "11",
    name: "Cargo Pants",
    slug: "cargo-pants",
    brand: { id: "b8", name: "H&M" },
    category: { id: "c9", name: "Pants" },
    sku: "PNT011",
    basePrice: 45.0,
    isActive: true,
  },
  {
    id: "12",
    name: "Fleece Sweatshirt",
    slug: "fleece-sweatshirt",
    brand: { id: "b3", name: "Adidas" },
    category: { id: "c10", name: "Sweatshirts" },
    sku: "SWT012",
    basePrice: 54.99,
    isActive: true,
  },
  {
    id: "13",
    name: "Running Shoes",
    slug: "running-shoes",
    brand: { id: "b4", name: "Puma" },
    category: { id: "c8", name: "Shoes" },
    sku: "SHOE013",
    basePrice: 99.99,
    isActive: false,
  },
  {
    id: "14",
    name: "Denim Shorts",
    slug: "denim-shorts",
    brand: { id: "b2", name: "Levi’s" },
    category: { id: "c4", name: "Shorts" },
    sku: "SH014",
    basePrice: 39.99,
    isActive: true,
  },
  {
    id: "15",
    name: "Wool Scarf",
    slug: "wool-scarf",
    brand: { id: "b6", name: "Gucci" },
    category: { id: "c6", name: "Accessories" },
    sku: "ACC015",
    basePrice: 85.0,
    isActive: false,
  },
  {
    id: "16",
    name: "Leather Boots",
    slug: "leather-boots",
    brand: { id: "b9", name: "Timberland" },
    category: { id: "c8", name: "Shoes" },
    sku: "SHOE016",
    basePrice: 139.99,
    isActive: true,
  },
  {
    id: "17",
    name: "Graphic Hoodie",
    slug: "graphic-hoodie",
    brand: { id: "b1", name: "Nike" },
    category: { id: "c3", name: "Hoodies" },
    sku: "HD017",
    basePrice: 59.99,
    isActive: true,
  },
  {
    id: "18",
    name: "Basic Tank Top",
    slug: "basic-tank-top",
    brand: { id: "b8", name: "H&M" },
    category: { id: "c1", name: "T-Shirts" },
    sku: "TSH018",
    basePrice: 14.99,
    isActive: true,
  },
  {
    id: "19",
    name: "Puffer Jacket",
    slug: "puffer-jacket",
    brand: { id: "b5", name: "Wrangler" },
    category: { id: "c5", name: "Jackets" },
    sku: "JCK019",
    basePrice: 129.99,
    isActive: true,
  },
  {
    id: "20",
    name: "Classic Cap",
    slug: "classic-cap",
    brand: { id: "b4", name: "Puma" },
    category: { id: "c6", name: "Accessories" },
    sku: "ACC020",
    basePrice: 22.99,
    isActive: false,
  },
];

const ProductsTable = () => {
  const [mounted, setMounted] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<unknown>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const columns: ColumnDef<ProductWithRelations>[] = getProductColumns();
  const data: ProductWithRelations[] = products;

  const globalSearchFilter: FilterFn<ProductWithRelations> = (
    row,
    columnIds,
    filterValue,
  ) => {
    const search = String(filterValue).toLowerCase();

    const columnsToSearch = ["name", "brand", "category", "sku"];

    return columnsToSearch.some((colId) => {
      const cellValue = row.getValue(colId);
      return String(cellValue).toLowerCase().includes(search);
    });
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
      <Loader2 className="flex size-6 w-full animate-spin items-center justify-center" />
    );

  return (
    <>
      <section>
        <TableSearch table={table} />
      </section>
      <section className="flex flex-wrap items-center justify-between gap-4">
        <DashboardProductFilters table={table} />
        <ProductBulkActions table={table} />
      </section>
      <section>
        <DataTable table={table} />
      </section>
    </>
  );
};
export default ProductsTable;
