"use client";

import {
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import {
  deleteCategory,
  reorderCategories,
} from "@/lib/actions/category.action";
import { CategoryWithChildren } from "@/types/prisma";

import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const CategoryTree = ({
  categories,
}: {
  categories: CategoryWithChildren[];
}) => {
  return (
    <div className="flex max-w-lg flex-col gap-4 px-4">
      {categories.map((cat) => (
        <CategoryNode
          key={cat.id}
          category={cat}
          siblings={categories}
          level={1}
        />
      ))}
    </div>
  );
};

const CategoryNode = ({
  category,
  siblings,
  level,
}: {
  category: CategoryWithChildren;
  siblings: CategoryWithChildren[];
  level: number;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleDelete = async (id: string) => {
    const result = await deleteCategory(id);

    if (result.success) {
      toast.success("Success", {
        description: "Category deleted successfully.",
      });
    } else {
      toast.error(`Error ${result.status}`, {
        description: result.error?.message || "Something went wrong.",
      });
    }
  };

  const handleMove = async (direction: "up" | "down") => {
    const index = siblings.findIndex((s) => s.id === category.id);
    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= siblings.length) return;

    const updated = siblings.map((s) => ({ id: s.id, order: s.order }));

    const temp = updated[index].order;
    updated[index].order = updated[targetIndex].order;
    updated[targetIndex].order = temp;

    const result = await reorderCategories(updated);

    if (result.success) {
      toast.success("Success", {
        description: "Categories reordered successfully.",
      });
    } else {
      toast.error(`Error ${result.status}`, {
        description: result.error?.message || "Something went wrong.",
      });
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col gap-4"
    >
      <div className="hover:bg-secondary relative flex items-center justify-between rounded-bl-lg border-b border-l px-4 py-2">
        <h2 className="pl-8 text-lg font-semibold">{category.name}</h2>
        {category.children && category.children.length > 0 && (
          <CollapsibleTrigger asChild>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="link"
                  size="icon"
                  className="absolute left-2 size-8 cursor-pointer"
                >
                  <ChevronsUpDownIcon className="size-5" />
                  <span className="sr-only">
                    {isOpen ? "Collapse" : "Expand"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isOpen ? "Collapse" : "Expand"}</p>
              </TooltipContent>
            </Tooltip>
          </CollapsibleTrigger>
        )}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"link"}
                className="text-muted-foreground"
                asChild
              >
                <Link href={`/dashboard/categories/${category.id}/edit`}>
                  <PencilIcon className="size-5" />
                  <span className="sr-only">Edit</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit</p>
            </TooltipContent>
          </Tooltip>

          {level < 3 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={"link"} className="text-green-600" asChild>
                  <Link href={`/dashboard/categories/create?c=${category.id}`}>
                    <PlusIcon className="size-5" />
                    <span className="sr-only">Add new sub-category</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add new sub-category</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={"link"} className="cursor-pointer">
                    <Trash2Icon className="text-destructive size-5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete</p>
                </TooltipContent>
              </Tooltip>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. Are you sure you want to
                  permanently delete this category?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant={"secondary"}>Cancel</Button>
                </DialogClose>
                <Button onClick={() => handleDelete(category.id)}>
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={"link"}
                  className="text-muted-foreground cursor-pointer"
                  disabled={category.order === 0}
                  onClick={() => handleMove("up")}
                >
                  <ChevronUpIcon className="size-5" />
                  <span className="sr-only">Move up</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Move up</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={"link"}
                  className="text-muted-foreground cursor-pointer"
                  disabled={category.order === siblings.length - 1}
                  onClick={() => handleMove("down")}
                >
                  <ChevronDownIcon className="size-5" />
                  <span className="sr-only">Move down</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Move down</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      {category.children && category.children.length > 0 && (
        <CollapsibleContent className="flex flex-col gap-4">
          {category.children.map((child) => (
            <div key={child.id} className="flex flex-col pl-8">
              <CategoryNode
                category={child as CategoryWithChildren}
                siblings={category.children as CategoryWithChildren[]}
                level={level + 1}
              />
            </div>
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};

export default CategoryTree;
