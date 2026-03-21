# E2E Scenario: Protected Route Redirect

## Test Goal

Verify that anonymous access to a protected page redirects to login and then returns to the original destination after successful login.

## Test Page Path

- attempted protected path: `/app`
- redirect path: `/login`
- post-login return path: `/app`

## Preconditions

- user is anonymous
- protected route requires authenticated state

## Steps

1. Open `/app` while anonymous.
2. Observe redirect behavior.
3. Complete login from `/login`.

## Assertions

- anonymous access to `/app` redirects to `/login`
- intended destination is preserved
- after successful login, the app returns to `/app`

## Invalid Redirect Guard

If the preserved redirect target is invalid:

- the app must ignore it
- the app should navigate to the default protected path `/app`
