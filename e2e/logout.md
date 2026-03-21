# E2E Scenario: Logout

## Test Goal

Verify that logout clears local auth state and returns the user to login even if backend cleanup fails.

## Test Page Path

- initial protected path: `/app`
- logout target path: `/login`

## Preconditions

- user starts authenticated on `/app`

## Steps

1. Open `/app` in authenticated state.
2. Trigger logout.
3. Observe resulting navigation and state.

## Assertions

- local access token is cleared
- current user state is cleared
- app redirects to `/login`
- protected content is no longer accessible

## Failure Variant

If backend logout fails:

- local auth state is still cleared
- user still ends on `/login`
