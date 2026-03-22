import type { AxiosInstance } from 'axios'

import { AUTH_ENDPOINTS } from '../lib/auth-endpoints'
import type { AuthSession } from '../types/auth-types'
import type { AuthRequestConfig } from './auth-http'

export interface AuthApi {
  login: (credentials: { email: string; password: string }) => Promise<AuthSession>
  refresh: () => Promise<AuthSession>
  logout: () => Promise<void>
}

export function createAuthApi(authHttp: AxiosInstance): AuthApi {
  return {
    async login(credentials) {
      const response = await authHttp.post<AuthSession>(AUTH_ENDPOINTS.login, credentials)
      return response.data
    },
    async refresh() {
      const response = await authHttp.post<AuthSession>(AUTH_ENDPOINTS.refresh, undefined, {
        skipAuthRefresh: true,
      } as AuthRequestConfig)
      return response.data
    },
    async logout() {
      await authHttp.post(AUTH_ENDPOINTS.logout, undefined, {
        skipAuthRefresh: true,
      } as AuthRequestConfig)
    },
  }
}
