import axios, {
  AxiosHeaders,
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

import type { AuthSession } from '../types/auth-types'

export interface AuthRequestConfig extends AxiosRequestConfig {
  skipAuthRefresh?: boolean
  authRetry?: boolean
}

export interface CreateAuthHttpClientOptions {
  baseURL: string
}

export interface CreateProtectedHttpClientOptions {
  baseURL: string
  getAccessToken: () => string | null
  refreshSession: () => Promise<AuthSession>
}

function readAuthorizationHeader(
  headers: AxiosRequestConfig['headers'] | InternalAxiosRequestConfig['headers'] | undefined,
): string | null {
  if (!headers) {
    return null
  }

  const authorization = toAxiosHeaders(headers).get('Authorization')
  return typeof authorization === 'string' ? authorization : null
}

function createHeadersWithAuthorization(
  headers: AxiosRequestConfig['headers'] | InternalAxiosRequestConfig['headers'] | undefined,
  accessToken: string,
) {
  const nextHeaders = toAxiosHeaders(headers)
  nextHeaders.set('Authorization', `Bearer ${accessToken}`)
  return nextHeaders
}

export function createAuthHttpClient({ baseURL }: CreateAuthHttpClientOptions): AxiosInstance {
  return axios.create({
    baseURL,
    withCredentials: true,
  })
}

export function createProtectedHttpClient({
  baseURL,
  getAccessToken,
  refreshSession,
}: CreateProtectedHttpClientOptions): AxiosInstance {
  const client = axios.create({
    baseURL,
    withCredentials: true,
  })

  let refreshPromise: Promise<AuthSession> | null = null

  client.interceptors.request.use((config) => {
    const protectedConfig = config as InternalAxiosRequestConfig & AuthRequestConfig

    if (protectedConfig.skipAuthRefresh || readAuthorizationHeader(protectedConfig.headers)) {
      return config
    }

    const accessToken = getAccessToken()
    if (!accessToken) {
      return config
    }

    protectedConfig.headers = createHeadersWithAuthorization(protectedConfig.headers, accessToken)

    return config
  })

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalConfig = error.config as AuthRequestConfig | undefined

      if (!shouldRefreshRequest(error, originalConfig)) {
        return Promise.reject(error)
      }

      const currentAccessToken = getAccessToken()
      if (!currentAccessToken) {
        return Promise.reject(error)
      }

      originalConfig.authRetry = true
      const currentAuthorization = `Bearer ${currentAccessToken}`
      const requestAuthorization = readAuthorizationHeader(originalConfig.headers)

      if (requestAuthorization && requestAuthorization !== currentAuthorization) {
        originalConfig.headers = createHeadersWithAuthorization(originalConfig.headers, currentAccessToken)
        return client.request(originalConfig)
      }

      const session = await getRefreshSession()
      originalConfig.headers = createHeadersWithAuthorization(originalConfig.headers, session.accessToken)

      return client.request(originalConfig)
    },
  )

  return client

  function getRefreshSession() {
    if (!refreshPromise) {
      refreshPromise = refreshSession().finally(() => {
        refreshPromise = null
      })
    }

    return refreshPromise
  }
}

function shouldRefreshRequest(error: AxiosError, config: AuthRequestConfig | undefined): config is AuthRequestConfig {
  if (error.response?.status !== 401 || !config) {
    return false
  }

  return !config.skipAuthRefresh && !config.authRetry && hasRefreshableAuthFailure(error)
}

function toAxiosHeaders(headers: AxiosRequestConfig['headers'] | InternalAxiosRequestConfig['headers'] | undefined) {
  return AxiosHeaders.from(headers as ConstructorParameters<typeof AxiosHeaders>[0] | undefined)
}

function hasRefreshableAuthFailure(error: AxiosError) {
  const authenticateHeader = error.response?.headers
    ? toAxiosHeaders(error.response.headers).get('WWW-Authenticate')
    : null

  if (typeof authenticateHeader !== 'string') {
    return true
  }

  return authenticateHeader.toLowerCase().includes('invalid_token')
}
