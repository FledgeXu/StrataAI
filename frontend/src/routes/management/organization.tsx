import {
  DataTable,
  PagingDataTableFooter,
  SearchAndFilterDataTableHeader,
} from "@/components/features/DataTable";
import { SectionHeader } from "@/components/features/SectionHeader";
import { createFileRoute } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";

export const Route = createFileRoute("/management/organization")({
  component: RouteComponent,
});

type Organization = {
  id: string;
  name: string;
  createdAt: number;
};

const TEST_DATA: Organization[] = [
  {
    id: "1",
    name: "Test Server",
    createdAt: Date.now(),
  },
];

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

function RouteComponent() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Organization management"
        description="Manage customer tenants, subscription plans, and integration access here."
      />
      <DataTable
        columns={columns}
        data={TEST_DATA}
        footer={PagingDataTableFooter}
      />
    </div>
  );
}
