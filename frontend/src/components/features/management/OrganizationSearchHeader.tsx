import { type Table as TanstackTable } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { SheetTrigger } from "@/components/ui/sheet";

export function OrganizationSearchHeader<TData>(table: TanstackTable<TData>) {
  return (
    <div className="flex items-center justify-between py-4">
      <Input
        placeholder="Search organization..."
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("name")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />

      <SheetTrigger asChild>
        <Button size="sm" type="button">
          <PlusIcon />
          New
        </Button>
      </SheetTrigger>
    </div>
  );
}
