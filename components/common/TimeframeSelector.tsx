"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { TIMEFRAMES } from "@/lib/constants/timeframes";
import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/utils/url";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const TimeframeSelector = ({ route }: { route: string }) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialValue = searchParams.get("timeframe") || "last_30_days";
  const [timeframe, setTimeframe] = useState(initialValue);

  useEffect(() => {
    if (initialValue) {
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "timeframe",
        value: timeframe,
        pathname,
      });

      router.push(newUrl, { scroll: false });
    } else {
      if (pathname === route) {
        const newUrl = removeKeysFromUrlQuery({
          params: searchParams.toString(),
          keysToRemove: ["timeframe"],
          pathname,
        });

        router.push(newUrl, { scroll: false });
      }
    }
  }, [initialValue, pathname, route, router, searchParams, timeframe]);

  return (
    <Select value={timeframe} onValueChange={(val) => setTimeframe(val)}>
      <SelectTrigger className="no-focus">
        <SelectValue placeholder="Select timeframe" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Timeframe</SelectLabel>
          {TIMEFRAMES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default TimeframeSelector;
