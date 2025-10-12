import {
  DataTable,
  PagingDataTableFooter,
} from "@/components/features/DataTable";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { SectionHeader } from "@/components/features/SectionHeader";
import { createFileRoute } from "@tanstack/react-router";
import type { Organization, OrganizationKind } from "@/types/organization";
import { useQuery } from "@tanstack/react-query";
import { fetchAllOrganizations } from "@/api";
import { Sheet } from "@/components/ui/sheet";
import { CreateOrganizationSheet } from "@/components/features/management/CreateOrganizationSheet";
import { QUERY_KEYS } from "@/types/queryKeys";
import { OrganizationSearchHeader } from "@/components/features/management/OrganizationSearchHeader";
import { OrganizationActionCell } from "@/components/features/management/OrganizationActionCell";
import { Badge } from "@/components/ui/badge";
import { SortableColumnHeader } from "@/components/features/SortableColumnHeader";

export const Route = createFileRoute("/management/organization")({
  component: RouteComponent,
});

const kindColorMap: Record<OrganizationKind, string> = {
  client: "bg-blue-100 text-blue-800",
  vendor: "bg-green-100 text-green-800",
  internal: "bg-gray-100 text-gray-800",
};

const columnHelper = createColumnHelper<Organization>();

const columns: ColumnDef<Organization>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableColumnHeader column={column} title="Name" />
    ),
    size: 240,
  },
  columnHelper.accessor("kind", {
    header: ({ column }) => (
      <SortableColumnHeader column={column} title="Kind" />
    ),
    cell: (info) => {
      const kind = info.getValue();
      const color = kindColorMap[kind];
      return <Badge className={color}>{kind}</Badge>;
    },
    size: 140,
  }),
  {
    accessorKey: "industry",
    header: ({ column }) => (
      <SortableColumnHeader column={column} title="Industry" />
    ),
    size: 200,
  },
  columnHelper.accessor("isActive", {
    header: ({ column }) => (
      <SortableColumnHeader column={column} title="Status" />
    ),
    cell: (info) => {
      const isActive = info.getValue();
      return (
        <Badge variant={isActive ? "default" : "destructive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    size: 120,
  }),
  columnHelper.accessor("createdAt", {
    header: ({ column }) => (
      <SortableColumnHeader column={column} title="Created At" />
    ),
    cell: (info) => info.getValue().toLocaleDateString(),
    size: 160,
  }),
  columnHelper.accessor("updatedAt", {
    header: ({ column }) => (
      <SortableColumnHeader column={column} title="Update At" />
    ),
    cell: (info) => info.getValue().toLocaleDateString(),
    size: 160,
  }),
  columnHelper.display({
    id: "actions",
    cell: (info) => OrganizationActionCell(info.row.original),
    enableSorting: false,
    size: 100,
  }),
] as Array<ColumnDef<Organization, unknown>>;

function RouteComponent() {
  const { data } = useQuery({
    queryKey: [QUERY_KEYS.FETCH_ALL_ORGANIZATIONS],
    queryFn: fetchAllOrganizations,
  });

  return (
    <Sheet>
      <CreateOrganizationSheet />
      <div className="space-y-6">
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
