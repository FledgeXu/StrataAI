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
import { type ReactNode } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const organizationKinds = ["client", "vendor", "internal"] as const;

export const formSchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters."),
  kind: z.enum(organizationKinds),
  industry: z.string().min(2, "Industry must be at least 2 characters."),
});

export type CreateOrganizationFormValues = z.infer<typeof formSchema>;

interface CreateOrganizationFormProps {
  onSubmit: (values: CreateOrganizationFormValues) => Promise<unknown> | void;
  renderActions?: (
    form: UseFormReturn<CreateOrganizationFormValues>,
  ) => ReactNode;
  resetOnSubmitSuccess?: boolean;
  defaultValues?: CreateOrganizationFormValues;
}

export function CreateOrganizationForm({
  onSubmit,
  renderActions,
  resetOnSubmitSuccess = true,
  defaultValues,
}: CreateOrganizationFormProps) {
  const form = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues ?? {
      name: "",
      kind: organizationKinds[0],
      industry: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    if (resetOnSubmitSuccess) {
      form.reset();
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
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
                  Use the full organization name as it should appear externally.
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
                  Describe the organization type, for example client or vendor.
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
                  Provide a short descriptor for the organization&apos;s sector.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {renderActions?.(form)}
      </form>
    </Form>
  );
}
