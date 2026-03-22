import { queryOptions, type QueryClient } from '@tanstack/react-query'
import axios from 'axios'

import { queryClient } from '@/app/query-client'
import { createAuthApi } from './auth-api'
import { createAuthHttpClient, createProtectedHttpClient } from './auth-http'
import type { AuthCredentials, AuthSession } from '../types/auth-types'

function resolveApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'
}

const baseURL = resolveApiBaseUrl()
const authApi = createAuthApi(createAuthHttpClient({ baseURL }))

export const authSessionKey = ['auth', 'session'] as const
export const authNoticeKey = ['auth', 'notice'] as const
const authRefreshKey = ['auth', 'refresh'] as const
let authSessionVersion = 0

export function authSessionQueryOptions() {
  return queryOptions({
    queryKey: authSessionKey,
    staleTime: Infinity,
    queryFn: async () => {
      try {
        return await authApi.refresh()
      } catch {
        return null
      }
    },
  })
}

export function readAuthSession(queryClient: QueryClient) {
  return queryClient.getQueryData<AuthSession | null>(authSessionKey) ?? null
}

export function readAuthNotice(queryClient: QueryClient) {
  return queryClient.getQueryData<string | null>(authNoticeKey) ?? null
}

export async function ensureAuthSession(queryClient: QueryClient) {
  return queryClient.ensureQueryData(authSessionQueryOptions())
}

export async function loginWithPassword(queryClient: QueryClient, credentials: AuthCredentials) {
  clearAuthNotice(queryClient)
  const session = await authApi.login(credentials)
  authSessionVersion += 1
  queryClient.setQueryData(authSessionKey, session)
  return session
}

export async function logoutSession(queryClient: QueryClient) {
  authSessionVersion += 1
  clearAuthNotice(queryClient)

  try {
    await authApi.logout()
  } catch {
    queryClient.setQueryData(authNoticeKey, 'You were signed out locally, but the server logout failed.')
  } finally {
    queryClient.removeQueries({ queryKey: authRefreshKey })
    queryClient.setQueryData(authSessionKey, null)
  }
}

export async function refreshSession(queryClient: QueryClient) {
  const sessionVersion = authSessionVersion

  try {
    const session = await queryClient.fetchQuery({
      queryKey: authRefreshKey,
      staleTime: 0,
      gcTime: 0,
      queryFn: () => authApi.refresh(),
    })

    if (sessionVersion !== authSessionVersion) {
      throw new SessionChangedError()
    }

    queryClient.setQueryData(authSessionKey, session)
    clearAuthNotice(queryClient)
    return session
  } catch (error) {
    if (error instanceof SessionChangedError) {
      throw error
    }

    queryClient.setQueryData(authSessionKey, null)
    queryClient.setQueryData(authNoticeKey, 'Your session expired. Please sign in again.')
    throw error
  }
}

export function clearAuthNotice(queryClient: QueryClient) {
  queryClient.setQueryData(authNoticeKey, null)
}

export async function fetchProtectedPing() {
  const response = await protectedHttp.get<{ message: string }>('/api/v1/secure/ping')
  return response.data
}

export async function fetchConcurrentProtectedPing() {
  return (await Promise.all([fetchProtectedPing(), fetchProtectedPing()]))[0]
}

export const protectedHttp = createProtectedHttpClient({
  baseURL,
  getAccessToken: () => readAuthSession(queryClient)?.accessToken ?? null,
  refreshSession: () => refreshSession(queryClient),
})

export function isUnauthorizedError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401
}

class SessionChangedError extends Error {
  constructor() {
    super('Session changed while refresh was in flight.')
  }
}
