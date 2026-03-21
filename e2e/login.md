# E2E Scenario: Login

## Test Goal

Verify that an anonymous user can log in from the login page and reach the protected app.

## Test Page Path

- initial page path: `/login`
- success target path: `/app`

## Preconditions

- user is anonymous
- backend login action returns `accessToken` and minimal `currentUser`

## Steps

1. Open `/login`.
2. Fill valid email and password.
3. Submit the login form.

## Assertions

- submit is disabled while the request is pending
- login success stores authenticated session state
- app redirects to `/app`
- protected app content becomes available

## Failure Variant

With invalid credentials:

- user remains on `/login`
- error message is shown
- protected content is not rendered
