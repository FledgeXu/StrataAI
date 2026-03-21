# E2E Scenario: Token Refresh Failure

## Test Goal

Verify that refresh failure clears auth state and returns the user to login from a protected page.

## Test Page Path

- initial protected path: `/app`
- failure target path: `/login`

## Preconditions

- user starts authenticated on `/app`
- access token is expired or rejected
- refresh request fails with `401`

## Steps

1. Open `/app` in authenticated state.
2. Trigger a protected API request that causes `401`.
3. Observe refresh attempt.

## Assertions

- only one refresh attempt runs for concurrent failures
- local auth state is cleared when refresh fails
- app redirects to `/login`
- protected content is no longer accessible

## Redirect Note

If the product keeps intended destination after refresh failure, the path should be preserved for post-login recovery.
