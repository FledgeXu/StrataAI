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
import { CreateOrganizationSheet } from "@/routes/management/components/CreateOrganizationSheet";
import { QUERY_KEYS } from "@/types/queryKeys";
import { OrganizationSearchHeader } from "./components/OrganizationSearchHeader";
import { OrganizationActionCell } from "./components/OrganizationActionCell";
import { Badge } from "@/components/ui/badge";

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
    header: "Name",
    size: 240,
  },
  columnHelper.accessor("kind", {
    header: "Kind",
    cell: (info) => {
      const kind = info.getValue();
      const color = kindColorMap[kind];
      return <Badge className={color}>{kind}</Badge>;
    },
    size: 140,
  }),
  {
    accessorKey: "industry",
    header: "Industry",
    size: 200,
  },
  columnHelper.accessor("isActive", {
    header: "Status",
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
    header: "Created At",
    cell: (info) => info.getValue().toLocaleDateString(),
    size: 160,
  }),
  columnHelper.accessor("updatedAt", {
    header: "Update At",
    cell: (info) => info.getValue().toLocaleDateString(),
    size: 160,
  }),
  columnHelper.display({
    id: "actions",
    cell: (info) => OrganizationActionCell(info.row.original),
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
