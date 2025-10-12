import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { UpdateOrganizationDialog } from "@/components/features/management/UpdateOrganizationDialog";
import { activateOrganization, deactivateOrganization } from "@/api";
import { QUERY_KEYS } from "@/types/queryKeys";
import { toast } from "sonner";

export function OrganizationActionCell(organization: Organization) {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const activateOrganizationMutation = useMutation({
    mutationFn: activateOrganization,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.FETCH_ALL_ORGANIZATIONS],
      });
      toast.success("Organization activated", {
        description: `"${organization.name}" is now active.`,
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Something went wrong while activating the organization.";
      toast.error("Activate organization failed", {
        description: `"${organization.name}" could not be activated. ${message}`,
      });
    },
  });

  const deactivateOrganizationMutation = useMutation({
    mutationFn: deactivateOrganization,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.FETCH_ALL_ORGANIZATIONS],
      });
      toast.success("Organization deactivated", {
        description: `"${organization.name}" is now inactive.`,
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Something went wrong while deactivating the organization.";
      toast.error("Deactivate organization failed", {
        description: `"${organization.name}" could not be deactivated. ${message}`,
      });
    },
  });

  const isStatusUpdatePending =
    activateOrganizationMutation.isPending ||
    deactivateOrganizationMutation.isPending;

  const handleStatusToggle = async () => {
    if (isStatusUpdatePending) {
      return;
    }

    const payload = { id: organization.id };

    if (organization.isActive) {
      await deactivateOrganizationMutation.mutateAsync(payload);
    } else {
      await activateOrganizationMutation.mutateAsync(payload);
    }
  };

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
            <DropdownMenuItem
              onSelect={() => {
                void handleStatusToggle();
              }}
              disabled={isStatusUpdatePending}
              variant={organization.isActive ? "destructive" : "default"}
            >
              {organization.isActive ? "Deactivate" : "Active"}
            </DropdownMenuItem>
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
