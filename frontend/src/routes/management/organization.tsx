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
import type { Organization } from "@/types/organization";
import { useQuery } from "@tanstack/react-query";
import { fetchAllOrganizations } from "@/api";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { CreateOrganizationSheet } from "@/routes/management/components/CreateOrganizationSheet";
import { QUERY_KEYS } from "@/types/queryKeys";

export const Route = createFileRoute("/management/organization")({
  component: RouteComponent,
});

const columnHelper = createColumnHelper<Organization>();

const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "kind",
    header: "Kind",
  },
  {
    accessorKey: "industry",
    header: "Industry",
  },
  {
    accessorKey: "isActive",
    header: "isActive",
  },
  columnHelper.accessor("createdAt", {
    header: "Created At",
    cell: (info) => info.getValue().toLocaleDateString(),
  }),
  columnHelper.accessor("updatedAt", {
    header: "Update At",
    cell: (info) => info.getValue().toLocaleDateString(),
  }),
] as const;

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

function RouteComponent() {
  const { data } = useQuery({
    queryKey: [QUERY_KEYS.FETCH_ALL_ORGANIZATIONS],
    queryFn: fetchAllOrganizations,
  });

  return (
    <Sheet>
      <CreateOrganizationSheet />
      <div className="space-y-6 m-4">
        <SectionHeader
          title="Organization management"
          description="Manage customer tenants, subscription plans, and integration access here."
        />
        <DataTable
          columns={columns}
          data={data ?? []}
          header={OrganizationSearchHeader}
          footer={PagingDataTableFooter}
        />
      </div>
    </Sheet>
  );
}
