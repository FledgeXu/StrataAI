import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import type { AppRouterContext } from '@/app/router'

const RootLayout = () => (
  <div className="min-h-dvh bg-background text-foreground">
    <Outlet />
    {import.meta.env.DEV ? <TanStackRouterDevtools /> : null}
  </div>
)

export const Route = createRootRouteWithContext<AppRouterContext>()({ component: RootLayout })
