import { APP_ROUTE_PATH, AUTH_REDIRECT_SEARCH_PARAM } from './auth-endpoints'

export function isValidInternalRedirectTarget(target: string | null | undefined): target is string {
  if (!target || typeof target !== 'string') {
    return false
  }

  if (!target.startsWith('/') || target.startsWith('//')) {
    return false
  }

  return !target.includes('://')
}

export function sanitizeRedirectTarget(target: string | null | undefined, fallback = APP_ROUTE_PATH) {
  return isValidInternalRedirectTarget(target) ? target : fallback
}

export function createLoginSearch(redirectTarget?: string) {
  return { [AUTH_REDIRECT_SEARCH_PARAM]: isValidInternalRedirectTarget(redirectTarget) ? redirectTarget : undefined }
}

export function readLoginRedirectTarget(search: Record<string, unknown>) {
  const value = search[AUTH_REDIRECT_SEARCH_PARAM]
  return sanitizeRedirectTarget(typeof value === 'string' ? value : undefined, APP_ROUTE_PATH)
}
