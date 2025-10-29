"use client";

import { SearchIcon } from "lucide-react";
import { useState, useRef } from "react";

import { cn } from "@/lib/utils";

import { Input } from "../ui/input";

const GlobalSearchInput = () => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative flex items-center">
      <Input
        ref={inputRef}
        type="text"
        className="no-focus md:border-foreground h-12 border-1 md:w-3xl md:border-3"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <p
        className={cn(
          "text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2 cursor-text transition-all duration-200 ease-in-out",
          focused || inputRef.current?.value
            ? "top-2 text-xs"
            : "top-1/2 text-base",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        Search
      </p>
      <SearchIcon className="absolute right-4 size-6 cursor-pointer" />
    </div>
  );
};

export default GlobalSearchInput;
