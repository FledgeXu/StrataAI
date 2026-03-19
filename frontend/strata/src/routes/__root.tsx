import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Button } from '@/components/ui/button'

const RootLayout = () => (
  <div>
    <h1 className="text-3xl font-bold underline">Hello world!</h1>
    <Button>HHHH</Button>
    <Outlet />
    <TanStackRouterDevtools />
  </div>
)

export const Route = createRootRoute({ component: RootLayout })
