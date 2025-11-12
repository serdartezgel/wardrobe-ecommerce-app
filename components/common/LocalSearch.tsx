"use client";

import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/utils/url";

import { Input } from "../ui/input";

const LocalSearch = ({ route }: { route: string }) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [searchQuery, setSearchQuery] = useState(query);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: searchQuery,
          pathname,
        });

        router.push(newUrl, { scroll: false });
      } else {
        if (pathname === route) {
          const newUrl = removeKeysFromUrlQuery({
            params: searchParams.toString(),
            keysToRemove: ["query"],
            pathname,
          });

          router.push(newUrl, { scroll: false });
        }
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, router, route, searchParams, pathname]);

  return (
    <div className="bg-sidebar my-4 flex max-w-sm items-center rounded-lg border-2 px-4 shadow-sm">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="!bg-sidebar no-focus w-sm border-none p-0 shadow-none outline-none"
      />
      <SearchIcon
        onClick={() => inputRef.current?.focus()}
        className="size-5 cursor-pointer"
      />
    </div>
  );
};

export default LocalSearch;
