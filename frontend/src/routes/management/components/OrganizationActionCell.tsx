import { useState } from "react";
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
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem>Active</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setIsUpdateDialogOpen(true)}>
              Update
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <UpdateOrganizationDialog
        organization={organization}
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
      />
    </>
  );
}
