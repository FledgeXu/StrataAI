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
import type { Organization, OrganizationKind } from "@/types/organization";
import { useQuery } from "@tanstack/react-query";
import { fetchAllOrganizations } from "@/api";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/management/organization")({
  component: RouteComponent,
});

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

const organizationKinds: OrganizationKind[] = ["client", "vendor", "internal"];

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

      <SheetTrigger>
        <Button size="sm">
          <PlusIcon />
          New
        </Button>
      </SheetTrigger>
    </div>
  );
}

function CreateOrgComponent() {
  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Create Organization.</SheetTitle>
        <SheetDescription>
          Provide the organization details below to create a new record.
        </SheetDescription>
      </SheetHeader>
      <FieldSet className="px-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input id="name" autoComplete="off" placeholder="Acme Corp" />
          </Field>
          <Field>
            <FieldLabel id="kind-label" htmlFor="kind">
              Kind
            </FieldLabel>
            <FieldContent>
              <Select defaultValue="client">
                <SelectTrigger
                  id="kind"
                  aria-labelledby="kind-label"
                  className="w-full"
                >
                  <SelectValue placeholder="Select kind" />
                </SelectTrigger>
                <SelectContent>
                  {organizationKinds.map((kind) => (
                    <SelectItem key={kind} value={kind}>
                      {kind.charAt(0).toUpperCase() + kind.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                Describe the organization type, for example client or vendor.
              </FieldDescription>
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="industry">Industry</FieldLabel>
            <Input id="industry" autoComplete="off" placeholder="Technology" />
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="isActive" defaultChecked />
            <FieldContent>
              <FieldLabel htmlFor="isActive">Active organization</FieldLabel>
              <FieldDescription>
                Toggle to mark the organization as active.
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>
      <SheetFooter>
        <Button type="submit">Save changes</Button>
        <SheetClose asChild>
          <Button variant="outline">Close</Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  );
}

function RouteComponent() {
  const { data } = useQuery({
    queryKey: ["fetchAllOrganizations"],
    queryFn: fetchAllOrganizations,
  });

  return (
    <Sheet>
      <CreateOrgComponent />
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
