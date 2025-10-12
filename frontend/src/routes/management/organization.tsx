import {
  DataTable,
  PagingDataTableFooter,
} from "@/components/features/DataTable";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { SectionHeader } from "@/components/features/SectionHeader";
import { createFileRoute } from "@tanstack/react-router";
import type { Organization } from "@/types/organization";
import { useQuery } from "@tanstack/react-query";
import { fetchAllOrganizations } from "@/api";
import { Sheet } from "@/components/ui/sheet";
import { CreateOrganizationSheet } from "@/routes/management/components/CreateOrganizationSheet";
import { QUERY_KEYS } from "@/types/queryKeys";
import { OrganizationSearchHeader } from "./components/OrganizationSearchHeader";
import { OrganizationActionCell } from "./components/OrganizationActionCell";

export const Route = createFileRoute("/management/organization")({
  component: RouteComponent,
});

const columnHelper = createColumnHelper<Organization>();

const columns: ColumnDef<Organization>[] = [
  {
    accessorKey: "name",
    header: "Name",
    size: 240,
  },
  {
    accessorKey: "kind",
    header: "Kind",
    size: 140,
  },
  {
    accessorKey: "industry",
    header: "Industry",
    size: 200,
  },
  {
    accessorKey: "isActive",
    header: "isActive",
    size: 120,
  },
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
