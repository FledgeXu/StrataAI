import type { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'

import { routeTree } from '@/routeTree.gen'

export interface AppRouterContext {
  queryClient: QueryClient
}

export const router = createRouter({
  routeTree,
  context: {
    queryClient: undefined as never,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
