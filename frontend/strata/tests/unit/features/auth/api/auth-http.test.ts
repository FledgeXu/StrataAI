import axios, { type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createAuthApi } from '@/features/auth/api/auth-api'
import { createAuthHttpClient, createProtectedHttpClient } from '@/features/auth/api/auth-http'
import type { AuthSession } from '@/features/auth/types/auth-types'

function response<T>(config: InternalAxiosRequestConfig, status: number, data: T): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: String(status),
    headers: status === 401 ? { 'www-authenticate': 'Bearer error="invalid_token"' } : {},
    config,
    request: {},
  }
}

function createAdapter(handlers: Record<string, (config: InternalAxiosRequestConfig) => Promise<AxiosResponse> | AxiosResponse>): AxiosAdapter {
  return async (config) => {
    const key = `${String(config.method ?? 'get').toUpperCase()} ${config.url}`
    const handler = handlers[key]

    if (!handler) {
      throw new Error(`Missing handler for ${key}`)
    }

    const response = await handler(config as InternalAxiosRequestConfig)
    const validateStatus = config.validateStatus ?? ((status: number) => status >= 200 && status < 300)

    if (validateStatus(response.status)) {
      return response
    }

    throw new axios.AxiosError(
      `Request failed with status code ${response.status}`,
      undefined,
      config,
      response.request,
      response,
    )
  }
}

const session: AuthSession = {
  accessToken: 'token-1',
  currentUser: {
    id: 1,
    email: 'user@example.com',
    displayName: 'Test User',
    role: 'admin',
    status: 'active',
  },
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('auth HTTP client', () => {
  it('sends auth requests with credentials enabled', async () => {
    const authHttp = createAuthHttpClient({ baseURL: 'http://example.test' })
    authHttp.defaults.adapter = createAdapter({
      'POST /api/v1/auth/login': (config) => {
        expect(config.withCredentials).toBe(true)
        return response(config, 200, session)
      },
    })

    const requests = createAuthApi(authHttp)
    await expect(requests.login({ email: 'user@example.com', password: 'secret' })).resolves.toEqual(session)
  })

  it('attaches the bearer token to protected requests', async () => {
    let accessToken = 'token-1'
    const protectedHttp = createProtectedHttpClient({
      baseURL: 'http://example.test',
      getAccessToken: () => accessToken,
      refreshSession: async () => session,
    })

    protectedHttp.defaults.adapter = createAdapter({
      'GET /protected': (config) => {
        expect((config.headers as Record<string, string>).Authorization).toBe('Bearer token-1')
        return response(config, 200, { ok: true })
      },
    })

    await expect(protectedHttp.get('/protected')).resolves.toMatchObject({ status: 200 })
    accessToken = 'token-2'
  })

  it('refreshes once and replays a 401 response', async () => {
    let accessToken = 'expired-token'
    let requestCount = 0
    const refreshSession = vi.fn(async () => {
      accessToken = 'fresh-token'
      return { ...session, accessToken: 'fresh-token' }
    })
    const protectedHttp = createProtectedHttpClient({
      baseURL: 'http://example.test',
      getAccessToken: () => accessToken,
      refreshSession,
    })

    protectedHttp.defaults.adapter = createAdapter({
      'GET /protected': (config) => {
        requestCount += 1

        if (requestCount === 1) {
          return response(config, 401, { error: 'unauthorized' })
        }

        expect((config.headers as Record<string, string>).Authorization).toBe('Bearer fresh-token')
        return response(config, 200, { ok: true })
      },
    })

    await expect(protectedHttp.get('/protected')).resolves.toMatchObject({ status: 200 })
    expect(refreshSession).toHaveBeenCalledTimes(1)
    expect(requestCount).toBe(2)
  })

  it('shares one refresh for concurrent 401 responses', async () => {
    let accessToken = 'expired-token'
    let requestCount = 0
    const refreshSession = vi.fn(async () => {
      accessToken = 'fresh-token'
      return { ...session, accessToken: 'fresh-token' }
    })
    const protectedHttp = createProtectedHttpClient({
      baseURL: 'http://example.test',
      getAccessToken: () => accessToken,
      refreshSession,
    })

    protectedHttp.defaults.adapter = createAdapter({
      'GET /protected': (config) => {
        requestCount += 1

        if (requestCount <= 2) {
          return response(config, 401, { error: 'unauthorized' })
        }

        return response(config, 200, { ok: true })
      },
    })

    await expect(Promise.all([protectedHttp.get('/protected'), protectedHttp.get('/protected')])).resolves.toHaveLength(2)
    expect(refreshSession).toHaveBeenCalledTimes(1)
    expect(requestCount).toBe(4)
  })

  it('does not retry forever when a replayed request still gets 401', async () => {
    let accessToken = 'expired-token'
    const refreshSession = vi.fn(async () => {
      accessToken = 'fresh-token'
      return { ...session, accessToken: 'fresh-token' }
    })
    const protectedHttp = createProtectedHttpClient({
      baseURL: 'http://example.test',
      getAccessToken: () => accessToken,
      refreshSession,
    })

    protectedHttp.defaults.adapter = createAdapter({
      'GET /protected': (config) => response(config, 401, { error: 'unauthorized' }),
    })

    await expect(protectedHttp.get('/protected')).rejects.toMatchObject({ response: { status: 401 } })
    expect(refreshSession).toHaveBeenCalledTimes(1)
  })

  it('does not start a second refresh after a concurrent refresh failure clears local auth state', async () => {
    let accessToken: string | null = 'expired-token'
    const refreshSession = vi.fn(async () => {
      accessToken = null
      throw new axios.AxiosError('Request failed with status code 401', undefined, undefined, undefined, {
        data: { error: 'unauthorized' },
        status: 401,
        statusText: '401',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
        request: {},
      })
    })
    const protectedHttp = createProtectedHttpClient({
      baseURL: 'http://example.test',
      getAccessToken: () => accessToken,
      refreshSession,
    })

    let requestCount = 0
    protectedHttp.defaults.adapter = createAdapter({
      'GET /protected': (config) => {
        requestCount += 1
        return response(config, 401, { error: 'unauthorized' })
      },
    })

    await expect(Promise.all([protectedHttp.get('/protected'), protectedHttp.get('/protected')])).rejects.toMatchObject({
      response: { status: 401 },
    })
    expect(refreshSession).toHaveBeenCalledTimes(1)
    expect(requestCount).toBe(2)
  })
})
