import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrganizationCreateInput } from "@/types/organization";
import { createOrganization } from "@/api";

const organizationKinds = ["client", "vendor", "internal"] as const;

const formSchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters."),
  kind: z.enum(organizationKinds),
  industry: z.string().min(2, "Industry must be at least 2 characters."),
});

type CreateOrganizationFormValues = z.infer<typeof formSchema>;

export function CreateOrganizationSheet() {
  const form = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      kind: "client",
      industry: "",
    },
  });
  const queryClient = useQueryClient();
  const createOrganizationMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      form.reset();
      void queryClient.invalidateQueries({
        // TODO: move all query keys to a file as constants.
        queryKey: ["fetchAllOrganizations"],
      });
    },
  });

  const onSubmit = (values: CreateOrganizationFormValues) => {
    const payload: OrganizationCreateInput = {
      ...values,
      isActive: true,
    };
    void createOrganizationMutation.mutateAsync(payload);
  };

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Create Organization.</SheetTitle>
        <SheetDescription>
          Provide the organization details below to create a new record.
        </SheetDescription>
      </SheetHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-6 px-4 pb-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Acme Corp"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use the full organization name as it should appear
                    externally.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kind"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kind</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
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
                  </FormControl>
                  <FormDescription>
                    Describe the organization type, for example client or
                    vendor.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Technology"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a short descriptor for the organization&apos;s
                    sector.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <SheetFooter>
            <Button type="submit">Save changes</Button>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </Form>
    </SheetContent>
  );
}
