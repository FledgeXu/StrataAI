import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const LoginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof LoginSchema>;

export default function LoginFormComponent() {
  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { username: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = form.handleSubmit((values) => {
    console.log(values);
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to Strata AI</CardTitle>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <CardContent className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input autoComplete="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <Button type="button" variant="outline" className="w-full">
              Login with Google
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
