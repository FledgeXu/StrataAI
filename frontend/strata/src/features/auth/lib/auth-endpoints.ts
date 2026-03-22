const API_V1_PREFIX = '/api/v1'

export const AUTH_ENDPOINTS = {
  login: `${API_V1_PREFIX}/auth/login`,
  refresh: `${API_V1_PREFIX}/auth/refresh`,
  logout: `${API_V1_PREFIX}/auth/logout`,
  me: `${API_V1_PREFIX}/auth/me`,
} as const

export const APP_ROUTE_PATH = '/app'
export const LOGIN_ROUTE_PATH = '/login'
export const AUTH_REDIRECT_SEARCH_PARAM = 'redirect'
