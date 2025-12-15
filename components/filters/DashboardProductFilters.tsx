"use client";

import { Table } from "@tanstack/react-table";
import { ChevronDownIcon, SlidersHorizontalIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { formatPrice } from "@/lib/utils/price";

import FilterBadge from "./FilterBadge";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";

const mockCategories = [
  { id: "1", name: "T-Shirts", slug: "t-shirts" },
  { id: "2", name: "Hoodies", slug: "hoodies" },
  { id: "3", name: "Jeans", slug: "jeans" },
  { id: "4", name: "Jackets", slug: "jackets" },
  { id: "5", name: "Accessories", slug: "accessories" },
];

const mockBrands = [
  { id: "1", name: "Nike", slug: "nike" },
  { id: "2", name: "Adidas", slug: "adidas" },
  { id: "3", name: "Puma", slug: "puma" },
  { id: "4", name: "Under Armour", slug: "under-armour" },
  { id: "5", name: "Reebok", slug: "reebok" },
];

const mockTags = [
  "summer",
  "winter",
  "sale",
  "new-arrival",
  "bestseller",
  "limited-edition",
  "eco-friendly",
  "premium",
];

interface DataTableProps<TData> {
  table: Table<TData>;
}

const DashboardProductFilters = <TData,>({ table }: DataTableProps<TData>) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  const tableRows = table.getCoreRowModel().rows;
  const statusFilterValue = table.getColumn("status")?.getFilterValue();
  const categoryFilterValue = table.getColumn("category")?.getFilterValue();
  const brandFilterValue = table.getColumn("brand")?.getFilterValue();

  useEffect(() => {
    const currentStatus =
      (table.getColumn("status")?.getFilterValue() as string) ?? "";
    const currentCategory =
      (table.getColumn("category")?.getFilterValue() as string) ?? "";
    const currentBrand =
      (table.getColumn("brand")?.getFilterValue() as string) ?? "";

    setStatus(currentStatus);
    setCategory(currentCategory);
    setBrand(currentBrand);

    const prices = table
      .getCoreRowModel()
      .rows.map((row) => row.getValue<number>("basePriceCents"));

    const min = prices.length > 0 ? Math.min(...prices) : 0;
    const max = prices.length > 0 ? Math.max(...prices) : 100000;

    setMinPrice(min);
    setMaxPrice(max);

    setPriceRange((prev) => [Math.max(prev[0], min), Math.min(prev[1], max)]);
  }, [
    tableRows,
    statusFilterValue,
    categoryFilterValue,
    brandFilterValue,
    table,
  ]);

  const activeFiltersCount = [
    status !== "",
    category !== "",
    brand !== "",
    priceRange[0] > minPrice || priceRange[1] < maxPrice,
    // tags.length > 0,
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    table.resetColumnFilters();
    setPriceRange([minPrice, maxPrice]);
  };

  // const handleTagToggle = (tag: string) => {
  //   const currentTags = table.getColumn("tags")?.getFilterValue() ?? [];
  //   const newTags = currentTags.includes(tag)
  //     ? currentTags.filter((t: string) => t !== tag)
  //     : [...currentTags, tag];
  //   table.getColumn("tags")?.setFilterValue(newTags);
  // };

  return (
    <div className="bg-muted border-border max-w-2xl rounded-lg border px-4 pt-4 shadow-sm">
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

          {/* Category */}
          <Select
            value={category}
            onValueChange={(value) =>
              table
                .getColumn("category")
                ?.setFilterValue(value === "all" ? "" : value)
            }
            disabled={tableRows.length === 0}
          >
            <SelectTrigger className="no-focus">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                <SelectItem value="all">All Categories</SelectItem>
                {mockCategories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Brand */}
          <Select
            value={brand}
            onValueChange={(value) =>
              table
                .getColumn("brand")
                ?.setFilterValue(value === "all" ? "" : value)
            }
            disabled={tableRows.length === 0}
          >
            <SelectTrigger className="no-focus">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Brand</SelectLabel>
                <SelectItem value="all">All Brands</SelectItem>
                {mockBrands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.slug}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* More Filters Toggle */}
          <Button
            variant={"secondary"}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="dark:bg-input/30 dark:hover:bg-input/50 border-input text-muted-foreground border bg-transparent"
          >
            <SlidersHorizontalIcon className="size-4" />
            More Filters
            {activeFiltersCount > 0 && (
              <span className="text-primary ml-1 px-2 text-xs">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDownIcon
              className={`size-4 transition-transform ${
                showAdvanced ? "rotate-180" : ""
              }`}
            />
          </Button>

          {/* Clear All */}
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

        {/* Advanced Filters */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showAdvanced ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t pt-4">
            {/* Price Range */}
            <div>
              <Label className="mb-2 text-sm font-medium">Price Range</Label>
              <div className="bg-muted my-4 flex max-w-sm flex-col gap-3 rounded-lg border px-4 shadow-sm">
                <Slider
                  value={priceRange}
                  min={minPrice}
                  max={maxPrice}
                  step={1}
                  onValueChange={(value) => {
                    setPriceRange([value[0], value[1]]);
                    table.getColumn("basePriceCents")?.setFilterValue(value);
                  }}
                  disabled={tableRows.length === 0}
                />{" "}
                <div className="text-muted-foreground flex justify-between text-sm">
                  {" "}
                  <span>Min: {formatPrice(priceRange[0])}</span>{" "}
                  <span>Max: {formatPrice(priceRange[1])}</span>{" "}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="pb-4">
              <Label className="mb-2 text-sm font-medium">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {mockTags.map((tag) => (
                  <Button
                    key={tag}
                    // onClick={() => handleTagToggle(tag)}
                    // className={`rounded-full px-3 py-1.5 text-sm ${
                    //   tags.includes(tag)
                    //     ? "bg-primary text-primary-foreground"
                    //     : "bg-accent text-accent-foreground"
                    // }`}
                    disabled={tableRows.length === 0}
                  >
                    {tag}
                    {/* {tags.includes(tag) && (
                      <XIcon className="ml-1 inline-block size-3" />
                    )} */}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="border-t py-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">Active Filters:</span>

            {status !== "" && (
              <FilterBadge
                label={`Status: ${status}`}
                onRemove={() => table.getColumn("status")?.setFilterValue("")}
              />
            )}

            {category !== "" && (
              <FilterBadge
                label={`Category: ${
                  mockCategories.find((c) => c.slug === category)?.name
                }`}
                onRemove={() => table.getColumn("category")?.setFilterValue("")}
              />
            )}

            {brand !== "" && (
              <FilterBadge
                label={`Brand: ${mockBrands.find((b) => b.slug === brand)?.name}`}
                onRemove={() => table.getColumn("brand")?.setFilterValue("")}
              />
            )}

            {(minPrice !== priceRange[0] || maxPrice !== priceRange[1]) && (
              <FilterBadge
                label={`Price: $${formatPrice(priceRange[0]) || "0"} – $${formatPrice(priceRange[1]) || "1000"}`}
                onRemove={() => {
                  setPriceRange([0, 100000]);
                  table
                    .getColumn("basePriceCents")
                    ?.setFilterValue([0, 100000]);
                }}
              />
            )}

            {/* {stockStatus !== "all" && (
              <FilterBadge
                label={`Stock: ${stockStatus}`}
                onRemove={
                  () =>
                  table.getColumn("stockStatus")?.setFilterValue("all")
                }
              />
            )} */}

            {/* {tags.map((tag) => (
              <FilterBadge
                key={tag}
                label={`Tag: ${tag}`}
                onRemove={() => handleTagToggle(tag)}
              />
            ))} */}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardProductFilters;
