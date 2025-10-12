import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Organization } from "@/types/organization";
import { Ellipsis } from "lucide-react";
import { UpdateOrganizationDialog } from "@/routes/management/components/UpdateOrganizationDialog";

export function OrganizationActionCell(organization: Organization) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem>Active</DropdownMenuItem>
          <UpdateOrganizationDialog organization={organization}>
            <DropdownMenuItem>Update</DropdownMenuItem>
          </UpdateOrganizationDialog>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
