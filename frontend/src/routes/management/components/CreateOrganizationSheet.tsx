import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrganizationKind } from "@/types/organization";
import { Button } from "@/components/ui/button";

const organizationKinds: OrganizationKind[] = ["client", "vendor", "internal"];

export function CreateOrganizationSheet() {
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
