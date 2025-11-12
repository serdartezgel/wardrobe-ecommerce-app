"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/utils/url";

import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface PaginationProps {
  isNext: boolean;
  totalItems: number;
}

const Pagination = ({ isNext, totalItems }: PaginationProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = searchParams.get("page") || 1;
  const pageSize = searchParams.get("pageSize") || 25;

  const handleNavigation = (type: "prev" | "next") => {
    const nextPageNumber =
      type === "prev" ? Number(page) - 1 : Number(page) + 1;

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: nextPageNumber.toString(),
      pathname,
    });

    router.push(newUrl);
  };

  const handlePageSizeChange = (size: number) => {
    const cleanedQuery = removeKeysFromUrlQuery({
      params: searchParams.toString(),
      keysToRemove: ["page"],
      pathname,
    });

    const query = cleanedQuery.split("?")[1] ?? "";

    let newQuery = formUrlQuery({
      params: query,
      key: "pageSize",
      value: size.toString(),
      pathname,
    });

    if (size === 25) {
      newQuery = removeKeysFromUrlQuery({
        params: query,
        keysToRemove: ["pageSize"],
        pathname,
      });
    }

    router.push(newQuery);
  };

  const goToFirstPage = () => {
    const newUrl = removeKeysFromUrlQuery({
      params: searchParams.toString(),
      keysToRemove: ["page"],
      pathname,
    });

    router.push(newUrl);
  };

  const goToLastPage = () => {
    if (totalItems === 0) return;

    const lastPage = Math.max(1, Math.ceil(totalItems / Number(pageSize)));

    const cleanedQuery = removeKeysFromUrlQuery({
      params: searchParams.toString(),
      keysToRemove: ["page"],
      pathname,
    });

    const newQuery = formUrlQuery({
      params: cleanedQuery.split("?")[1] ?? "",
      key: "page",
      value: lastPage.toString(),
      pathname,
    });

    router.push(newQuery);
  };

  return (
    <div className="my-4 flex flex-wrap items-center justify-between gap-6 px-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">Rows per page</p>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => {
            handlePageSizeChange(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pageSize.toString()} />
          </SelectTrigger>
          <SelectContent side="top">
            {[5, 10, 25, 50, 100].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4 lg:gap-8">
        <div className="flex w-[100px] items-center text-sm font-medium">
          Page {page} of{" "}
          {Math.ceil(totalItems / Number(pageSize)) === 0
            ? 1
            : Math.ceil(totalItems / Number(pageSize))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => goToFirstPage()}
            disabled={Number(page) === 1 || totalItems === 0}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => handleNavigation("prev")}
            disabled={Number(page) === 1 || totalItems === 0}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => handleNavigation("next")}
            disabled={!isNext || totalItems === 0}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => goToLastPage()}
            disabled={
              totalItems === 0 ||
              Number(page) ===
                Math.max(1, Math.ceil(totalItems / Number(pageSize)))
            }
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
