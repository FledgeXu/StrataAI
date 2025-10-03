import { DataTable } from "@/components/features/DataTable";
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
];

function RouteComponent() {
  return (
    <div>
      <div>User management</div>
      <div>
        management your team and memebers and their account permissions here.
      </div>
      <DataTable columns={columns} data={TEST_DATA} />
    </div>
  );
}
