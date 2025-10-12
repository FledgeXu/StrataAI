import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { Organization } from "@/types/organization";
import { toast } from "sonner";
import { updateOrganization } from "@/api";
import { QUERY_KEYS } from "@/types/queryKeys";
import {
  CreateOrganizationForm,
  type CreateOrganizationFormValues,
} from "@/routes/management/components/CreateOrganizationForm";

interface UpdateOrganizationDialogProps {
  organization: Organization;
  children: ReactNode;
}

export function UpdateOrganizationDialog({
  organization,
  children,
}: UpdateOrganizationDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const defaultValues = useMemo(
    () => ({
      name: organization.name,
      kind: organization.kind,
      industry: organization.industry,
    }),
    [organization.name, organization.kind, organization.industry]
  );

  const updateOrganizationMutation = useMutation({
    mutationFn: updateOrganization,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.FETCH_ALL_ORGANIZATIONS],
      });
      toast.success("Organization updated", {
        description: `"${variables.name ?? organization.name}" was updated successfully.`,
      });
      setIsDialogOpen(false);
    },
    onError: (error, variables) => {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Something went wrong while updating the organization.";
      toast.error("Update organization failed", {
        description: `"${variables?.name ?? organization.name}" could not be updated. ${message}`,
      });
    },
  });

  const handleUpdate = async (values: CreateOrganizationFormValues) => {
    const payload = {
      id: organization.id,
      ...values,
    };
    await updateOrganizationMutation.mutateAsync(payload);
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update organization</DialogTitle>
          <DialogDescription>
            Make changes to the organization details below.
          </DialogDescription>
        </DialogHeader>
        <CreateOrganizationForm
          key={organization.id}
          onSubmit={handleUpdate}
          defaultValues={defaultValues}
          resetOnSubmitSuccess={false}
          renderActions={(form) => (
            <DialogFooter>
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting ||
                  updateOrganizationMutation.isPending
                }
              >
                Save changes
              </Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={form.formState.isSubmitting}
                >
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          )}
        />
      </DialogContent>
    </Dialog>
  );
}
