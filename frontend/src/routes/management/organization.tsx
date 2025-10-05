import {
  DataTable,
  PagingDataTableFooter,
} from "@/components/features/DataTable";
import {
  createColumnHelper,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import { SectionHeader } from "@/components/features/SectionHeader";
import { createFileRoute } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export const Route = createFileRoute("/management/organization")({
  component: RouteComponent,
});

type Organization = {
  id: string;
  name: string;
  category: string;
  industry: string;
  status: string;
  createdAt: number;
};

const TEST_DATA: Organization[] = [
  {
    id: "1",
    name: "Test Server",
    category: "provider",
    industry: "provider",
    status: "active",
    createdAt: Date.now(),
  },
  {
    id: "2",
    name: "Test Provider",
    category: "provider",
    industry: "provider",
    status: "active",
    createdAt: Date.now(),
  },
];

const columnHelper = createColumnHelper<Organization>();

const columns: ColumnDef<Organization>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "createdAt",
    header: "createdAt",
    meta: {
      widthClass: "text-center",
    },
  },
];

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
      <Button size="sm">
        <PlusIcon />
        New
      </Button>
    </div>
  );
}

function RouteComponent() {
  return (
    <div className="space-y-6 m-4">
      <SectionHeader
        title="Organization management"
        description="Manage customer tenants, subscription plans, and integration access here."
      />
      <DataTable
        columns={columns}
        data={TEST_DATA}
        header={OrganizationSearchHeader}
        footer={PagingDataTableFooter}
      />
    </div>
  );
}
