import { Button } from "../ui/button";

const ProductBulkActions = () => {
  return (
    <div className="bg-sidebar border-border w-fit rounded-lg border-2 px-4 py-4 shadow-sm">
      <div className="border-border mb-4 flex flex-wrap gap-3 border-b pb-4">
        <Button disabled>Activate</Button>
        <Button variant={"destructive"} disabled>
          Delete
        </Button>
        <Button variant={"outline"} disabled>
          Export
        </Button>
      </div>
      <p className="text-muted-foreground text-sm"># items selected</p>
    </div>
  );
};

export default ProductBulkActions;
