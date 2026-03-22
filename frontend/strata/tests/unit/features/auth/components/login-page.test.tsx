import type { ReactNode } from 'react'
import axios from 'axios'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { LoginPage } from '@/routes/login'

const navigateMock = vi.fn()
const loginWithPasswordMock = vi.fn()

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router')

  function Navigate({ to, search, replace }: { to: string; search?: unknown; replace?: boolean; children?: ReactNode }) {
    return <div data-testid="navigate" data-to={to} data-search={JSON.stringify(search)} data-replace={String(replace)} />
  }

  return {
    ...actual,
    Navigate,
    useNavigate: () => navigateMock,
  }
})

vi.mock('@/features/auth/api/auth-query', () => ({
  loginWithPassword: (...args: unknown[]) => loginWithPasswordMock(...args),
  readAuthNotice: () => null,
}))

const session = {
  accessToken: 'token-1',
  currentUser: {
    id: 1,
    email: 'user@example.com',
    displayName: 'Test User',
    role: 'admin',
    status: 'active',
  },
}

function renderLoginPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <LoginPage redirectTarget="/app" />
    </QueryClientProvider>,
  )
}

afterEach(() => {
  vi.restoreAllMocks()
  loginWithPasswordMock.mockReset()
  navigateMock.mockReset()
  cleanup()
})

describe('login page', () => {
  it('shows field validation for an empty form submission', async () => {
    renderLoginPage()

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByTestId('login-alert')).toHaveTextContent('Email is required.')
  })

  it('shows field validation for invalid email format', async () => {
    renderLoginPage()

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByTestId('login-alert')).toHaveTextContent('Enter a valid email address.')
  })

  it('disables submit while a login request is pending', async () => {
    let resolveLogin!: (value: typeof session) => void
    loginWithPasswordMock.mockImplementation(
      () =>
        new Promise<typeof session>((resolve) => {
          resolveLogin = resolve
        }),
    )

    renderLoginPage()

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByRole('button', { name: /signing in/i })).toBeDisabled()

    resolveLogin(session)
    await waitFor(() => expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled())
  })

  it('redirects to the preserved destination after login success', async () => {
    loginWithPasswordMock.mockResolvedValue(session)

    renderLoginPage()

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith({ to: '/app', replace: true }))
  })

  it('shows an invalid credential message', async () => {
    loginWithPasswordMock.mockRejectedValue(
      new axios.AxiosError('Request failed with status code 401', undefined, undefined, undefined, {
        data: { code: 'AUTH_INVALID_CREDENTIALS' },
        status: 401,
        statusText: '401',
        headers: {},
        config: { headers: {} },
        request: {},
      }),
    )

    renderLoginPage()

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByTestId('login-alert')).toHaveTextContent('Email or password is incorrect.')
  })

  it('shows a generic message for server-side login failures', async () => {
    loginWithPasswordMock.mockRejectedValue(
      new axios.AxiosError('Request failed with status code 500', undefined, undefined, undefined, {
        data: {},
        status: 500,
        statusText: '500',
        headers: {},
        config: { headers: {} },
        request: {},
      }),
    )

    renderLoginPage()

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByTestId('login-alert')).toHaveTextContent('Unable to sign in right now. Please try again.')
  })

  it('shows a network-specific message when the server cannot be reached', async () => {
    loginWithPasswordMock.mockRejectedValue(new axios.AxiosError('Network Error'))

    renderLoginPage()

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByTestId('login-alert')).toHaveTextContent(
      'Unable to reach the server. Check your connection and try again.',
    )
  })
})
