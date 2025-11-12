import { XIcon } from "lucide-react";

import { Button } from "../ui/button";

const FilterBadge = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) => (
  <span className="bg-background inline-flex items-center gap-1 rounded-full border px-3 py-1 capitalize">
    {label}
    <Button
      variant={"ghost"}
      onClick={onRemove}
      className="text-destructive !p-1"
    >
      <XIcon className="size-3" />
    </Button>
  </span>
);

export default FilterBadge;
