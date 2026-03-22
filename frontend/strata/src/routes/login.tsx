import { useState } from 'react'
import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ensureAuthSession, loginWithPassword, readAuthNotice } from '@/features/auth/api/auth-query'
import { readLoginRedirectTarget } from '@/features/auth/lib/auth-redirect'

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ context, search }) => {
    const session = await ensureAuthSession(context.queryClient)
    if (session) {
      throw redirect({ to: readLoginRedirectTarget(search), replace: true })
    }
  },
  component: LoginRoute,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
})

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage({ redirectTarget }: { redirectTarget: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })
  const loginMutation = useMutation({
    mutationFn: (values: LoginValues) => loginWithPassword(queryClient, values),
  })

  async function handleSubmit(values: LoginValues) {
    try {
      await loginMutation.mutateAsync(values)
      form.setValue('password', '')
      navigate({ to: redirectTarget, replace: true })
    } catch {
      form.setValue('password', '')
    }
  }

  const authMessage = loginMutation.error
    ? resolveLoginMessage(loginMutation.error)
    : readAuthNotice(queryClient)
  const showFieldErrors = hasSubmitted && !authMessage
  const fieldError = showFieldErrors ? Object.values(form.formState.errors)[0]?.message : null
  const isSubmitting = form.formState.isSubmitting || loginMutation.isPending

  const submitLogin = form.handleSubmit(handleSubmit)

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.12),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.15),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.04)_0%,_transparent_50%,_rgba(15,23,42,0.03)_100%)]" />
      <div className="relative flex min-h-dvh items-center justify-center p-6">
        <Card className="w-full max-w-md border-border/70 bg-background/90 shadow-xl backdrop-blur">
          <CardHeader className="space-y-3">
            <CardTitle>Sign in to StrataAI</CardTitle>
            <CardDescription>Use your email address and password to continue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {(fieldError || authMessage) && (
              <Alert variant={fieldError ? 'destructive' : 'default'}>
                <AlertTitle>{fieldError ? 'Sign-in failed' : 'Session notice'}</AlertTitle>
                <AlertDescription data-testid="login-alert">{fieldError ?? authMessage}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  setHasSubmitted(true)
                  void submitLogin(event)
                }}
                noValidate
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input data-testid="email-input" type="email" autoComplete="email" {...field} />
                      </FormControl>
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
                        <Input data-testid="password-input" type="password" autoComplete="current-password" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button
                  className="w-full"
                  type="submit"
                  data-testid="login-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in…' : 'Sign in'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter>
            <Separator />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

function resolveLoginMessage(error: unknown) {
  if (readApiErrorCode(error) === 'AUTH_INVALID_CREDENTIALS') {
    return 'Email or password is incorrect.'
  }

  if (axios.isAxiosError(error) && !error.response) {
    return 'Unable to reach the server. Check your connection and try again.'
  }

  return 'Unable to sign in right now. Please try again.'
}

function readApiErrorCode(error: unknown) {
  if (!axios.isAxiosError(error) || !error.response?.data || typeof error.response.data !== 'object') {
    return null
  }

  const code = (error.response.data as { code?: unknown }).code
  return typeof code === 'string' ? code : null
}

function LoginRoute() {
  const search = Route.useSearch()
  const redirectTarget = readLoginRedirectTarget(search)

  return <LoginPage redirectTarget={redirectTarget} />
}

export default LoginRoute
