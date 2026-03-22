# Strata Backend

This backend is split into explicit Gradle modules, not just Java packages.

## Module boundary

- `authentication`
  Holds the authentication bounded context.
  It owns auth HTTP interfaces, application services, security wiring, persistence mappers, and auth-specific configuration.
- `app`
  Holds the Spring Boot entrypoint and runtime assembly.
  It depends on domain modules such as `authentication`, but should not absorb their business code back into itself.

## Why this is a module split

This is an intentional DDD boundary, not an incidental refactor.

The goal is to keep:

- business capabilities isolated by bounded context
- the boot module thin
- future capabilities able to grow as sibling modules instead of becoming subpackages under `app`

In practice, that means new business areas should prefer becoming modules alongside `authentication` when they have their own interfaces, application logic, and persistence concerns.

## Current package shape inside `authentication`

- `interfaces`
  HTTP controllers and DTOs at the module boundary
- `application`
  use-case level orchestration
- `infrastructure`
  security, persistence, and configuration details

## Rule of thumb

If code exists only to start Spring Boot or assemble modules, it belongs in `app`.

If code expresses authentication capability, policy, persistence, or APIs, it belongs in `authentication`.

## Current refresh-token semantics

The current implementation keeps refresh tokens stable until they expire or are explicitly logged out.

That means:

- a successful `/auth/refresh` issues a new access token
- the refresh token itself is not rotated
- `/auth/logout` revokes the refresh session

This is an intentional current behavior and is covered by integration tests.

## HTTP contract

All backend HTTP endpoints live under `/api/v1/*`.

- `/api/v1/auth/*`
  Authentication endpoints
- `/api/v1/secure/*`
  Authenticated business endpoints

### Authentication model

- `POST /api/v1/auth/login`
  Accepts credentials, returns an access token in the JSON body, and sets the refresh token as an `HttpOnly` cookie.
- `POST /api/v1/auth/refresh`
  Uses only the refresh-token cookie and returns a new access token in the JSON body.
- `GET /api/v1/auth/me`
  Uses the bearer access token.
- `POST /api/v1/auth/logout`
  Uses the refresh-token cookie and revokes the refresh session.

### Error contract

Error responses are JSON and use a shared shape:

- `code`
- `message`
- `status`
- `path`
- `timestamp`
- `details`

Current stable codes include:

- `VALIDATION_ERROR`
- `MALFORMED_JSON`
- `AUTH_INVALID_CREDENTIALS`
- `AUTH_UNAUTHORIZED`
- `ACCESS_DENIED`
- `RATE_LIMITED`
- `INTERNAL_ERROR`
