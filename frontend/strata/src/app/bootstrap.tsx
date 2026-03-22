import { RouterProvider } from '@tanstack/react-router'

import { queryClient } from '@/app/query-client'

import { router } from './router'

export function AppBootstrap() {
  return <RouterProvider router={router} context={{ queryClient }} />
}
