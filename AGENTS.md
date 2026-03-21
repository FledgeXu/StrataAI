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
- Prefer deleting unused code, duplicated logic, and obsolete compatibility layers instead of continuing to accumulate concepts.
- Within the bounds of the requirements, choose the simplest implementation that is easiest to test.
- Prefer clear, direct functional style, keeping the boundaries between inputs, outputs, and side effects explicit.
- Names must express intent accurately; compared with shorter forms, prefer structures that are easier to understand.
- Control mutable state and scope, and avoid implicit sharing, cross-layer coupling, and unnecessary abstraction.
- Handle external inputs, boundary conditions, and failure paths explicitly.
- Refactor in small steps, but if old code is already obsolete, delete it directly instead of keeping a compatibility shell.
- Code should be designed for testability, isolating I/O, time, randomness, and dependencies on external systems.
- Comments should explain only constraints, reasons, and trade-offs, not restate the obvious surface meaning of the code.
