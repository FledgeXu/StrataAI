import type { Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

type SortableColumnHeaderProps<TData> = {
  column: Column<TData, unknown>;
  title: string;
};

export function SortableColumnHeader<TData>({
  column,
  title,
}: SortableColumnHeaderProps<TData>) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}
