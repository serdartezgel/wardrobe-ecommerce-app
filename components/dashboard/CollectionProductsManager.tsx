"use client";

import { PlusIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";

const CollectionProductsManager = ({
  collectionId,
}: {
  collectionId: string;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  console.log(collectionId);

  return (
    <div className="bg-card space-y-4 rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Products</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 size-4" />
              Add Products
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add Products to Collection</DialogTitle>
              <DialogDescription>
                Search and select products to add to this collection
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative">
                <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="no-focus pl-10"
                />
              </div>

              <div className="bg-muted rounded-md p-8 text-center">
                <p className="text-muted-foreground text-sm">
                  Product search functionality coming soon
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-muted rounded-md p-8 text-center">
        <p className="text-muted-foreground mb-2 text-sm font-medium">
          No products added yet
        </p>
        <p className="text-muted-foreground text-xs">
          Click &quot;Add Products&quot; to start adding products to this
          collection
        </p>
      </div>

      <div className="bg-muted/50 rounded-md border-2 border-dashed p-4">
        <p className="text-muted-foreground text-center text-sm">
          Products can be reordered by drag and drop once added
        </p>
      </div>
    </div>
  );
};

export default CollectionProductsManager;
