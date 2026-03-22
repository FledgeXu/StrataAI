import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  authSessionQueryOptions,
  ensureAuthSession,
  fetchConcurrentProtectedPing,
  fetchProtectedPing,
  logoutSession,
  readAuthSession,
} from '@/features/auth/api/auth-query'
import { APP_ROUTE_PATH, LOGIN_ROUTE_PATH } from '@/features/auth/lib/auth-endpoints'
import { createLoginSearch } from '@/features/auth/lib/auth-redirect'

export const Route = createFileRoute('/app')({
  beforeLoad: async ({ context, location }) => {
    const session = await ensureAuthSession(context.queryClient)
    if (!session) {
      throw redirect({
        to: LOGIN_ROUTE_PATH,
        search: createLoginSearch(location.href || APP_ROUTE_PATH),
        replace: true,
      })
    }
  },
  component: AppRoute,
})

function AppRoute() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const sessionQuery = useQuery(authSessionQueryOptions())
  const [requestStatus, setRequestStatus] = useState('Ready to check the protected API.')
  const [requestError, setRequestError] = useState<string | null>(null)
  const logoutMutation = useMutation({
    mutationFn: () => logoutSession(queryClient),
  })
  const pingMutation = useMutation({
    mutationFn: fetchProtectedPing,
    onSuccess: (result) => {
      setRequestStatus(result.message)
      setRequestError(null)
    },
    onError: () => {
      setRequestError('Unable to reach the protected API right now.')
    },
  })
  const concurrentPingMutation = useMutation({
    mutationFn: fetchConcurrentProtectedPing,
    onSuccess: (result) => {
      setRequestStatus(result.message)
      setRequestError(null)
    },
    onError: () => {
      setRequestError('Unable to reach the protected API right now.')
    },
  })

  const session = sessionQuery.data ?? readAuthSession(queryClient)

  useEffect(() => {
    if (!session) {
      navigate({ to: LOGIN_ROUTE_PATH, search: { redirect: undefined }, replace: true })
    }
  }, [navigate, session])

  if (!session) {
    return null
  }

  async function handleLogout() {
    await logoutMutation.mutateAsync()
    navigate({ to: LOGIN_ROUTE_PATH, search: { redirect: undefined }, replace: true })
  }

  const isRunningProtectedRequest = pingMutation.isPending || concurrentPingMutation.isPending

  return (
    <div
      data-testid="app-shell"
      className="min-h-dvh bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.12),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.15),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] p-6"
    >
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-4xl items-center justify-center">
        <Card className="w-full max-w-2xl border-border/70 bg-background/90 shadow-xl backdrop-blur">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>You are signed in and can access protected content.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm leading-6">
              <div className="font-medium">Current user</div>
              <div>{session.currentUser.displayName}</div>
              <div className="text-muted-foreground">{session.currentUser.email}</div>
            </div>

            <div data-testid="protected-status" className="rounded-lg border border-border bg-background p-4 text-sm leading-6">
              <div className="font-medium">Protected request</div>
              <div className="text-muted-foreground">Use this action to exercise the refresh flow.</div>
              <div className="mt-2">{requestStatus}</div>
              {requestError ? <div className="mt-2 text-destructive">{requestError}</div> : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                data-testid="logout-button"
                onClick={() => {
                  void handleLogout()
                }}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                data-testid="protected-request-button"
                disabled={isRunningProtectedRequest}
                onClick={() => {
                  void pingMutation.mutateAsync()
                }}
              >
                {isRunningProtectedRequest ? 'Checking…' : 'Check protected API'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                data-testid="protected-concurrent-button"
                disabled={isRunningProtectedRequest}
                onClick={() => {
                  void concurrentPingMutation.mutateAsync()
                }}
              >
                Run concurrent checks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AppRoute
