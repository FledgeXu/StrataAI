# E2E Scenario: App Bootstrap Session Restore

## Test Goal

Verify that the app restores a valid session on startup without showing protected-content flicker.

## Test Page Path

- initial page path: `/app`

## Preconditions

- browser has a valid refresh cookie
- backend refresh action returns `accessToken` and minimal `currentUser`

## Steps

1. Open `/app`.
2. Observe the initial bootstrap state.
3. Wait for the silent restore request to finish.

## Assertions

- protected content is not rendered before auth resolution
- the app does not redirect to `/login`
- the app ends in authenticated state
- the `/app` page renders successfully after restore

## Failure Variant

If refresh fails during bootstrap:

- the app clears local auth state
- the app redirects to `/login`
- no protected content is shown before redirect
