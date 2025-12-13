"use client";

import {
  useSensors,
  useSensor,
  PointerSensor,
  DndContext,
  closestCenter,
  DragOverlay,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronsUpDownIcon,
  GripVerticalIcon,
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState(categories);

  const sensors = useSensors(useSensor(PointerSensor));

  const findCategoryById = (id: string): CategoryWithChildren | undefined =>
    items.find((c) => c.id === id);

  const handleReorder = async (newItems: CategoryWithChildren[]) => {
    setItems(newItems);
    const result = await reorderCategories(
      newItems.map((c, idx) => ({ id: c.id, order: idx })),
    );

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);

    await handleReorder(newItems);
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => setActiveId(event.active.id as string)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col justify-center gap-12 px-4">
          {categories.map((cat) => (
            <CategoryNode key={cat.id} category={cat} level={1} />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeId ? (
          <div className="bg-secondary rounded border px-4 py-2 opacity-70">
            {findCategoryById(activeId)?.name}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

interface CategoryNodeProps {
  category: CategoryWithChildren;
  level: number;
}

const CategoryNode = ({ category, level }: CategoryNodeProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [children, setChildren] = useState(category.children || []);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const sensors = useSensors(useSensor(PointerSensor));

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

  const handleChildReorder = async (newChildren: CategoryWithChildren[]) => {
    setChildren(newChildren);
    const result = await reorderCategories(
      newChildren.map((c, idx) => ({ id: c.id, order: idx })),
    );

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = children.findIndex((c) => c.id === active.id);
    const newIndex = children.findIndex((c) => c.id === over.id);
    const newChildren = arrayMove(children, oldIndex, newIndex);

    await handleChildReorder(newChildren as CategoryWithChildren[]);
  };

  return (
    <>
      <Collapsible
        ref={setNodeRef}
        style={style}
        open={isOpen}
        onOpenChange={setIsOpen}
        className="flex flex-col gap-4"
      >
        <div className="hover:bg-secondary flex items-center justify-between rounded-bl-lg border-b border-l p-2">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  {...attributes}
                  {...listeners}
                  variant={"link"}
                  className="flex cursor-grab items-center justify-center active:cursor-grabbing"
                >
                  <GripVerticalIcon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Drag & Drop</p>
              </TooltipContent>
            </Tooltip>
            <h2 className="text-lg font-semibold">{category.name}</h2>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={"link"}
                  className="text-muted-foreground"
                  asChild
                >
                  <Link href={`/dashboard/categories/${category.slug}/edit`}>
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
                    <Link
                      href={`/dashboard/categories/create?c=${category.id}`}
                    >
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button variant={"link"} className="cursor-pointer">
                      <Trash2Icon className="text-destructive size-5" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete</p>
                </TooltipContent>
              </Tooltip>
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
                  <Button
                    variant={"destructive"}
                    onClick={() => handleDelete(category.id)}
                  >
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {category.children && category.children.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="link"
                      size="icon"
                      className="size-8 cursor-pointer"
                    >
                      <ChevronsUpDownIcon className="size-5" />
                      <span className="sr-only">
                        {isOpen ? "Collapse" : "Expand"}
                      </span>
                    </Button>
                  </CollapsibleTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isOpen ? "Collapse" : "Expand"}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        {category.children && category.children.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={category.children.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <CollapsibleContent className="flex flex-col gap-4">
                {category.children.map((child) => (
                  <div key={child.id} className="flex flex-col pl-8">
                    <CategoryNode
                      category={child as CategoryWithChildren}
                      level={level + 1}
                    />
                  </div>
                ))}
              </CollapsibleContent>
            </SortableContext>
          </DndContext>
        )}
      </Collapsible>
    </>
  );
};

export default CategoryTree;
