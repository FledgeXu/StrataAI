import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createOrganization } from "@/api";
import type { OrganizationCreateInput } from "@/types/organization";
import { QUERY_KEYS } from "@/types/queryKeys";
import {
  CreateOrganizationForm,
  type CreateOrganizationFormValues,
} from "@/routes/management/components/CreateOrganizationForm";

export function CreateOrganizationSheet() {
  const queryClient = useQueryClient();
  const createOrganizationMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.FETCH_ALL_ORGANIZATIONS],
      });
      toast.success("Organization created", {
        description: `"${variables.name}" was added successfully.`,
      });
    },
    onError: (error, variables) => {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Something went wrong while creating the organization.";
      toast.error("Create organization failed", {
        description: `"${variables?.name ?? "Organization"}" could not be added. ${message}`,
      });
    },
  });

  const onSubmit = async (values: CreateOrganizationFormValues) => {
    const payload: OrganizationCreateInput = {
      ...values,
      isActive: true,
    };
    await createOrganizationMutation.mutateAsync(payload);
  };

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Create Organization.</SheetTitle>
        <SheetDescription>
          Provide the organization details below to create a new record.
        </SheetDescription>
      </SheetHeader>

      <CreateOrganizationForm
        onSubmit={onSubmit}
        renderActions={(form) => (
          <SheetFooter>
            <Button
              type="submit"
              disabled={
                form.formState.isSubmitting ||
                createOrganizationMutation.isPending
              }
            >
              Save changes
            </Button>
            <SheetClose asChild>
              <Button variant="outline" disabled={form.formState.isSubmitting}>
                Close
              </Button>
            </SheetClose>
          </SheetFooter>
        )}
      />
    </SheetContent>
  );
}
