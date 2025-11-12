"use client";

import { ChevronDownIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/utils/url";

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

const DashboardProductFilters = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = searchParams.toString();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const status = searchParams.get("status") || "all";
  const category = searchParams.get("category") || "all";
  const brand = searchParams.get("brand") || "all";
  const stockStatus = searchParams.get("stock") || "all";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const [priceRange, setPriceRange] = useState<number[]>([
    Number(minPrice) || 0,
    Number(maxPrice) || 1000,
  ]);

  const tags = useMemo(() => {
    const raw = searchParams.get("tags");
    return raw ? raw.split(",").filter(Boolean) : [];
  }, [searchParams]);

  useEffect(() => {
    let count = 0;
    if (status !== "all") count++;
    if (category !== "all") count++;
    if (brand !== "all") count++;
    if (minPrice || maxPrice) count++;
    if (stockStatus !== "all") count++;
    count += tags.length;
    setActiveFiltersCount(count);
  }, [status, category, brand, minPrice, maxPrice, stockStatus, tags]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      let url = params;

      url = formUrlQuery({
        params: url.split("?")[1] ?? params,
        key: "minPrice",
        value: priceRange[0].toString(),
        pathname,
      });

      url = formUrlQuery({
        params: url.split("?")[1] ?? params,
        key: "maxPrice",
        value: priceRange[1].toString(),
        pathname,
      });

      if (priceRange[0] === 0 && priceRange[1] === 1000) {
        url = removeKeysFromUrlQuery({
          params,
          keysToRemove: ["minPrice", "maxPrice"],
          pathname,
        });
      }

      console.log(url, url.split("?")[1]);

      router.push(url, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [router, pathname, searchParams, priceRange, params]);

  const updateSearchParams = (key: string, value: string | null) => {
    const params = searchParams.toString();

    const defaultValues = ["all", "", null];

    let url;

    if (defaultValues.includes(value)) {
      url = removeKeysFromUrlQuery({
        params,
        keysToRemove: [key],
        pathname,
      });
    } else {
      url = formUrlQuery({
        params,
        key,
        value,
        pathname,
      });
    }

    router.push(url, { scroll: false });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = tags.includes(tag)
      ? tags.filter((t) => t !== tag)
      : [...tags, tag];

    let url;

    if (newTags.length > 0) {
      url = formUrlQuery({
        params: searchParams.toString(),
        key: "tags",
        value: newTags.join(","),
        pathname,
      });
    } else {
      url = removeKeysFromUrlQuery({
        params: searchParams.toString(),
        keysToRemove: ["tags"],
        pathname,
      });
    }

    router.push(url, { scroll: false });
  };

  const handleClearFilters = () => {
    const url = removeKeysFromUrlQuery({
      params: searchParams.toString(),
      keysToRemove: [
        "status",
        "category",
        "brand",
        "minPrice",
        "maxPrice",
        "stock",
        "tags",
      ],
      pathname,
    });
    setPriceRange([0, 1000]);

    router.push(url, { scroll: false });
  };

  const removeFilter = (key: string) => {
    const url = removeKeysFromUrlQuery({
      params: searchParams.toString(),
      keysToRemove: [key],
      pathname,
    });

    router.push(url, { scroll: false });
  };

  return (
    <div className="bg-sidebar border-border mb-4 w-fit rounded-lg border-2 px-4 pt-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status */}
          <Select
            value={status}
            onValueChange={(value) => updateSearchParams("status", value)}
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
            onValueChange={(value) => updateSearchParams("category", value)}
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
            onValueChange={(value) => updateSearchParams("brand", value)}
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

          {/* Stock */}
          <Select
            value={stockStatus}
            onValueChange={(value) => updateSearchParams("stock", value)}
          >
            <SelectTrigger className="no-focus">
              <SelectValue placeholder="Select stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Stock</SelectLabel>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* More Filters Toggle */}
          <Button
            variant={"secondary"}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="dark:bg-input/30 dark:hover:bg-input/50 border-input border bg-transparent"
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
              <div className="bg-sidebar my-4 flex max-w-sm flex-col gap-3 rounded-lg border-2 px-4 shadow-sm">
                <Slider
                  value={priceRange}
                  min={0}
                  max={1000}
                  step={1}
                  onValueChange={(value) => setPriceRange([value[0], value[1]])}
                />{" "}
                <div className="text-muted-foreground flex justify-between text-sm">
                  {" "}
                  <span>Min: {priceRange[0]}</span>{" "}
                  <span>Max: {priceRange[1]}</span>{" "}
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
                    onClick={() => handleTagToggle(tag)}
                    className={`rounded-full px-3 py-1.5 text-sm ${
                      tags.includes(tag)
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground"
                    }`}
                  >
                    {tag}
                    {tags.includes(tag) && (
                      <XIcon className="ml-1 inline-block size-3" />
                    )}
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

            {status !== "all" && (
              <FilterBadge
                label={`Status: ${status}`}
                onRemove={() => removeFilter("status")}
              />
            )}

            {category !== "all" && (
              <FilterBadge
                label={`Category: ${
                  mockCategories.find((c) => c.slug === category)?.name
                }`}
                onRemove={() => removeFilter("category")}
              />
            )}

            {brand !== "all" && (
              <FilterBadge
                label={`Brand: ${mockBrands.find((b) => b.slug === brand)?.name}`}
                onRemove={() => removeFilter("brand")}
              />
            )}

            {(minPrice || maxPrice) && (
              <FilterBadge
                label={`Price: $${minPrice || "0"} – $${maxPrice || "1000"}`}
                onRemove={() => {
                  setPriceRange([0, 1000]);
                  removeFilter("minPrice");
                  removeFilter("maxPrice");
                }}
              />
            )}

            {stockStatus !== "all" && (
              <FilterBadge
                label={`Stock: ${stockStatus}`}
                onRemove={() => removeFilter("stock")}
              />
            )}

            {tags.map((tag) => (
              <FilterBadge
                key={tag}
                label={`Tag: ${tag}`}
                onRemove={() => handleTagToggle(tag)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardProductFilters;
