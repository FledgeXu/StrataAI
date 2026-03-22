import { StrictMode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import '@/index.css'
import ReactDOM from 'react-dom/client'
import { AppBootstrap } from '@/app/bootstrap'
import { queryClient } from '@/app/query-client'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppBootstrap />
    </QueryClientProvider>
  </StrictMode>,
)
