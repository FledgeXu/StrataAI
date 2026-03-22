import { createFileRoute, redirect } from '@tanstack/react-router'

import { APP_ROUTE_PATH } from '@/features/auth/lib/auth-endpoints'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: APP_ROUTE_PATH, replace: true })
  },
})
