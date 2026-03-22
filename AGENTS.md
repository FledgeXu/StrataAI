# AGENTS.md

## Fundamental Principle
For any updates to AGENTS.md, only the sections under Maintain by Robot should be updated; all other parts must not be modified.

## Maintain by Human

### Package Management
- All new packages must be installed through the package manager, and the newest feasible version should be preferred whenever possible; do not manually pin fixed versions unless there is a clear constraint-based reason.
- The impact scope of new dependencies should be kept as small as possible, and their necessity should be confirmed before introducing them.
- All backend APIs must be verified with curl to ensure the request chain is complete, runs correctly, and can be successfully invoked.ll 

## Maintain by Robot
- Understand the existing implementation before modifying code, and avoid refactoring based on guesswork.
- This repository is organized by runtime boundary: `frontend/strata` for the Vite + React application, `backend/strata` for the Gradle-based Spring Boot backend, `dev` for local environment support, and `e2e` for scenario notes; keep changes inside the correct boundary and avoid mixing concerns.
- In `frontend/strata/src`, keep `app` focused on bootstrap and shared runtime assembly, `routes` focused on route definitions, and `features/*` focused on business capabilities; when adding frontend behavior, prefer extending an existing feature module before creating new cross-cutting abstractions.
- In the frontend, treat `features/auth` as the current capability boundary and keep API access, runtime coordination, store state, types, and UI logic separated by their existing subdirectories.
- In `backend/strata`, preserve the module split: `app` owns Spring Boot startup and runtime assembly, while `authentication` owns authentication HTTP interfaces, application services, persistence, security, and related configuration; new business capabilities should not be pushed back into `app`.
- Respect the backend package layering inside `authentication`: `interfaces` for HTTP boundary code and DTOs, `application` for use-case orchestration, and `infrastructure` for persistence, security, and framework details.
- Keep backend HTTP contracts consistent with the current API shape under `/api/v1/*`, and preserve the established auth behavior unless the task explicitly changes it.
- Prefer deleting unused code, duplicated logic, generated-by-hand wrappers, and obsolete compatibility layers instead of continuing to accumulate concepts.
- Within the bounds of the requirements, choose the simplest implementation that is easiest to test.
- Prefer clear, direct functional style, keeping the boundaries between inputs, outputs, and side effects explicit.
- Names must express intent accurately; compared with shorter forms, prefer structures that are easier to understand.
- Control mutable state and scope, and avoid implicit sharing, cross-layer coupling, and unnecessary abstraction.
- Handle external inputs, boundary conditions, and failure paths explicitly.
- Refactor in small steps, but if old code is already obsolete, delete it directly instead of keeping a compatibility shell.
- Code should be designed for testability, isolating I/O, time, randomness, and dependencies on external systems; reuse the existing `ClockConfig`, frontend test setup, and integration-test patterns instead of introducing ad hoc seams.
- Frontend changes should stay compatible with the current toolchain and verification flow: `eslint`, `vitest`, and Playwright in `frontend/strata/tests`; backend changes should stay compatible with Gradle module tests and existing integration coverage.
- Treat generated artifacts like `frontend/strata/src/routeTree.gen.ts` as generated output and prefer changing the source inputs rather than hand-editing generated files unless regeneration is impossible for the task.
- Comments should explain only constraints, reasons, and trade-offs, not restate the obvious surface meaning of the code.
